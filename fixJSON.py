#!/usr/bin/env python

import yaml
import json
import sys

print(sys.argv)

if len(sys.argv) < 3:
	output_file = sys.argv[1].split('.')[0] + ' (fixed).json'
else:
	output_file = sys.argv[2]

brokenJson = open(sys.argv[1], 'r')

fixedJson = open(output_file, 'w')

#with open(sys.argv[1], 'rt', encoding='utf8') as yml:
#    json_obj = yaml.load(yml)

jsonContent = brokenJson.read().replace("\\m", " ")

fixedJson.write(json.dumps(yaml.load(jsonContent)))

brokenJson.close()
fixedJson.close()

