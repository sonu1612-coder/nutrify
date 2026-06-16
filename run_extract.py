import sys, json, os
from pathlib import Path
from graphify.extract import collect_files, extract
from graphify.llm import extract_corpus_parallel

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8-sig'))
all_files = [Path(f) for files in detect['files'].values() for f in files]

# Part A - AST
code_files = []
for f in detect.get('files', {}).get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

if code_files:
    ast_result = extract(code_files, cache_root=Path('.'))
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(ast_result, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"AST: {len(ast_result.get('nodes', []))} nodes, {len(ast_result.get('edges', []))} edges")
else:
    ast_result = {'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(ast_result, ensure_ascii=False), encoding='utf-8')

# Include transcripts
transcripts = []
if Path('graphify-out/.graphify_transcripts.json').exists():
    try:
        t_paths = json.loads(Path('graphify-out/.graphify_transcripts.json').read_text(encoding='utf-8-sig'))
        transcripts = [Path(p) for p in t_paths]
        all_files.extend(transcripts)
    except Exception as e: 
        print(f"Transcript load failed: {e}")

# Part B - Semantic using Gemini
docs = [f for f in all_files if f not in code_files]
if docs:
    sem_result = extract_corpus_parallel(docs, backend='gemini')
    Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(sem_result, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Semantic: {len(sem_result.get('nodes', []))} nodes, {len(sem_result.get('edges', []))} edges")
else:
    sem_result = {'nodes':[],'edges':[],'hyperedges':[],'input_tokens':0,'output_tokens':0}
    Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(sem_result, ensure_ascii=False), encoding='utf-8')

# Part C - Merge
seen = {n['id'] for n in ast_result.get('nodes', [])}
merged_nodes = list(ast_result.get('nodes', []))
for n in sem_result.get('nodes', []):
    if n['id'] not in seen:
        merged_nodes.append(n)
        seen.add(n['id'])

merged_edges = ast_result.get('edges', []) + sem_result.get('edges', [])
merged_hyperedges = sem_result.get('hyperedges', [])
merged = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': sem_result.get('input_tokens', 0),
    'output_tokens': sem_result.get('output_tokens', 0),
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')
print(f"Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges")
