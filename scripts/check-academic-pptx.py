"""Check explicitly styled native text against a framed-academic export manifest.

Usage: python check-academic-pptx.py deck.pptx text-manifest.json
Does not resolve inherited master/theme styles; unsupported properties are errors.
Does not inspect image text, facts, layout fit, or semantic alignment.
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}

def check(pptx, manifest):
    errors, actual = [], {}
    with zipfile.ZipFile(pptx) as package:
        for part in package.namelist():
            match = re.fullmatch(r'ppt/slides/slide(\d+)\.xml', part)
            if not match:
                continue
            number = int(match.group(1))
            root = ET.fromstring(package.read(part))
            for shape in root.findall('.//p:sp', NS):
                content = ''.join(t.text or '' for t in shape.findall('.//a:t', NS))
                if not content:
                    continue
                name = shape.find('p:nvSpPr/p:cNvPr', NS).get('name')
                key = (number, name)
                if key in actual:
                    errors.append(f'{key}: duplicate named text object')
                actual[key] = (shape, content)
    expected = {(m['slide'], m['id']): m for m in manifest}
    for key in actual.keys() - expected.keys():
        errors.append(f'{key}: native text absent from manifest')
    for key, item in expected.items():
        if key not in actual:
            errors.append(f'{key}: missing native text object')
            continue
        shape, content = actual[key]
        if re.sub(r'\s+', '', content) != re.sub(r'\s+', '', item['text']):
            errors.append(f'{key}: text mismatch')
        body = shape.find('p:txBody', NS)
        if body.find('a:bodyPr/a:normAutofit', NS) is not None:
            errors.append(f'{key}: shrink-to-fit enabled')
        props = body.findall('.//a:rPr', NS) + body.findall('.//a:defRPr', NS)
        explicit = [prop for prop in props if prop.get('sz') is not None]
        if not explicit:
            errors.append(f'{key}: font size not explicit; inherited-style check unsupported')
        for prop in explicit:
            if abs(int(prop.get('sz')) - item['size'] * 75) > 1:
                errors.append(f'{key}: size mismatch')
            color = prop.find('a:solidFill/a:srgbClr', NS)
            if color is None or color.get('val').upper() != item['color'].lstrip('#').upper():
                errors.append(f'{key}: text color mismatch')
            font = prop.find('a:latin', NS)
            if font is None or font.get('typeface') != item['font']:
                errors.append(f'{key}: font mismatch')
    return {'ok': not errors, 'nativeTextObjects': len(actual), 'errors': sorted(set(errors))}

if __name__ == '__main__':
    with open(sys.argv[2], encoding='utf-8') as stream:
        result = check(sys.argv[1], json.load(stream))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result['ok'] else 1)
