"""Check semantic content and native geometry for this prototype's generated decks."""
import json, sys, zipfile
from xml.etree import ElementTree as E

deck, config = sys.argv[1:3]
specs = json.load(open(config, encoding='utf-8'))['slides']
ns = {'p':'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
results=[]
with zipfile.ZipFile(deck) as z:
    for i,spec in enumerate(specs,1):
        root=E.fromstring(z.read(f'ppt/slides/slide{i}.xml'))
        shapes=root.findall('.//p:sp',ns)
        texts={}
        for shape in shapes:
            name=shape.find('p:nvSpPr/p:cNvPr',ns).get('name','')
            value=''.join(shape.itertext()) # overwritten with text runs only
            texts[name]=''.join(t.text or '' for t in shape.findall('.//a:t',ns))
        norm=lambda v: ''.join(v.split())
        assert norm(texts['page.title'])==norm(spec['title'])
        photos=len(root.findall('.//p:pic',ns))
        if spec['type']=='ribbon-ring':
            assert photos==0, 'Ring must not be rasterized'
            assert norm(texts['ring.center'])==norm(spec['center'])
            for j,item in enumerate(spec['items']):
                value=''.join(texts[f'ring.label-{j}.char-{k}'] for k in range(len(norm(item['label']))))
                assert value==norm(item['label'])
                assert f'ring.segment-{j}' in texts
        elif spec['type']=='three-columns':
            assert photos==sum('image' in c for c in spec['columns'])
            for j,col in enumerate(spec['columns']):
                assert texts[f'column.heading-{j}']==col['heading']
                for k,item in enumerate(col['bullets']):
                    assert norm(texts[f'column.item-{j}-{k}'])==norm(item)
        else:
            assert photos==0, 'Pyramid must not be rasterized'
            for j,level in enumerate(spec['levels']):
                assert norm(texts[f'tier.title-{j}'])==norm(level['title'])
                assert norm(texts[f'tier.body-{j}'])==norm(level['body'])
                assert f'tier.front-{j}' in texts
        results.append({'slide':i,'type':spec['type'],'native_shapes':len(shapes),'pictures':photos,'content_check':'pass'})
print(json.dumps(results,ensure_ascii=False,indent=2))
