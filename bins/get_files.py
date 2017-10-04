import requests
from bs4 import BeautifulSoup

def RecurseLinks(base, ext=''):
    f = requests.get(base).text
    soup = BeautifulSoup(f,"html.parser")
    for anchor in soup.find_all('a'):
        href = anchor.get('href')
        if (href.startswith('/')):
            print ('skip, most likely the parent folder -> ' + href)
        elif (href.endswith('/')):
            if href.startswith('.') == False:
                print ('crawl -> [' + base + href + ']')
                RecurseLinks(base + href) # make recursive call w/ the new base folder
        else: 
            if anchor.get('href').endswith(ext):
                with open("filenames.txt","a") as myfile:
                    myfile.write(href.replace("%20"," ")+"\n")
                
                

RecurseLinks('http://dl.jahandl.biz/movie/khareji/b/4/',"mp4")

