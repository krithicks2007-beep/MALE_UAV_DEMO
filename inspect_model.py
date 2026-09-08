import json

with open('dashboard/public/model_web.glb', 'rb') as f:
    f.seek(12)
    chunk_len = int.from_bytes(f.read(4), 'little')
    f.read(4)
    raw = f.read(chunk_len).decode('utf-8', errors='ignore')
    data = json.loads(raw)
    nodes = data.get('nodes', [])
    for idx, n in enumerate(nodes):
        children = n.get('children', [])
        if children:
            print(f"Node {idx}: name='{n.get('name')}', children_count={len(children)}")
