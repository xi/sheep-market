import sys

import cbor


def parse_url(s):
    data = []
    parts = s.strip().lstrip('?').split('&')
    for part in parts:
        key, value = part.split('=', 1)
        if key in ['xOff', 'yOff']:
            data.append(round(float(value or '0') * 2))
        else:
            assert key == 'drawing'
            for cmd in value.split('_'):
                cmd = cmd.split('.')
                if cmd[0] == 'lift':
                    data.append([cmd[0]])
                elif cmd[0] in ['stroke', 'grey']:
                    data.append([cmd[0], int(cmd[1], 10)])
                elif cmd[0].isdigit():
                    data.append([int(x, 10) for x in cmd])
    return data


def dump_url(data):
    cmds = '_'.join('.'.join(str(x) for x in cmd) for cmd in data[2:])
    return f'yOff={data[0] / 2}&xOff={data[1] / 2}&drawing={"_".join(cmds)}'


if __name__ == '__main__':
    for k in range(0, 100):
        items = []
        for i in range(k * 100, (k + 1) * 100):
            print(i + 1, end='\r', file=sys.stderr)
            with open(f'data/{i + 1}') as fh:
                items.append(parse_url(fh.read()))
        with open(f'bin/{k}', 'wb') as fh:
            cbor.dump(items, fh)
