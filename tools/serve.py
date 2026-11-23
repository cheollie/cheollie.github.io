from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from functools import partial
import argparse
root=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        resolved=Path(super().translate_path(path))
        if not resolved.exists() and not resolved.suffix and resolved.with_suffix('.html').is_file():
            return str(resolved.with_suffix('.html'))
        return str(resolved)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=4184);args=parser.parse_args()
    ThreadingHTTPServer(('127.0.0.1',args.port),partial(Handler,directory=str(root))).serve_forever()
