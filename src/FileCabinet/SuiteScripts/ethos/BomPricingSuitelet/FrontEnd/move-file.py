
import glob, os, shutil

basePath = "./dist-other/assets"
os.chdir(basePath)

for file in glob.glob("index-*.js"):
    shutil.copy(file, "../../dist/assets/index.publish.js" )

for file in glob.glob("index-*.css"):
    shutil.copy(file, "../../dist/assets/index.publish.css" )

print('FILES TO PUBLISH Mo ved!')