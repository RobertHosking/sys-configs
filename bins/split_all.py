import glob, os, re, subprocess, pipes
import tmdbsimple as tmdb

tmdb.API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'

os.chdir("/mnt/Drive/Compressing")
raw = glob.glob("*.mp4")

f = open('times.txt', 'r').readlines()
def shell_format(string):
    return string.replace(" ","\ ").replace("(", "\(").replace(")", "\)").replace("[","\[").replace("]", "\]")

print raw
i = 0
print len(f)
print len(raw)
if len(f) == len(raw):
    print "Size error."
else:
    for r in raw:
        print "Begin: "+r
        names = re.findall("S(\d\d?)E(\d\d?)", r)
        print names
        season = names[0][0]
        seriesInfo = tmdb.TV_Seasons(15260, int(season)).info()
        for c in [0,1]:
            if c == 0:
                print "PART ONE: "+ r
                start = "00:00:00"
                end = f[i].split(" ")[c]
                name = names[0]
                episode = names[0][1]
            else:
                print "PART TWO: "+r
                start = f[i].split(" ")[0]
                end = f[i].split(" ")[c]
                name = names[1]
                episode = names[1][1]
            title = seriesInfo['episodes'][int(episode)]['name']
            outfile = "S"+season+"E"+episode+" "+title+".mp4"
            action = "avconv -i "+shell_format(r)+" -acodec copy -vcodec copy -ss "+start+" -t "+end+" "+shell_format(outfile) 
            print action
            os.system(action)
        i += 1
