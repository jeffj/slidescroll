#!/usr/bin/python
#
# PyODConverter (Python OpenDocument Converter) v1.1.1 - 2009-03-27
#
# This script converts a document from one office format to another by
# connecting to an OpenOffice.org instance via Python-UNO bridge.
#
# Copyright (C) 2008 Mirko Nasato <mirko@artofsolving.com>
# Licensed under the GNU LGPL v2.1 - http://www.gnu.org/licenses/lgpl-2.1.html
# - or any later version.
#
# With modifications, OptionParser, FilterData options
# Copyright(C) 2009 Chris Cox <ccox@endlessnow.com>
#
#
# With modifications, SldieScroll, Distributed system parsing and S3 integration.
# Copyright(C) 2013 Jeff Jenkins <jeff@jenkinsj.com>
#
DEFAULT_OPENOFFICE_PORT = 8100

import sys
sys.path.insert(0, '/Library/Python/2.7/site-packages/CherryPy-3.2.2-py2.7.egg')
import cherrypy

import re
import urllib2
import os

from os.path import abspath
from os.path import isfile
from os.path import splitext

import sys
from StringIO import StringIO

# Chris Cox
from optparse import OptionParser
from optparse import OptionValueError

import shutil

try:
	import uno
except ImportError: #probably a Fedora/Redhat/SuSE system
	sys.path.append('/usr/lib/ooo3/basis3.0/program/')

	try:
		import uno
	except ImportError: #unable to find Python UNO libraries, exiting
		sys.stderr.write("Error: Unable to find Python UNO libraries in %s. Exiting..." % sys.path)		
		sys.exit(0)

from os.path import abspath, isfile, splitext
from com.sun.star.beans import PropertyValue
from com.sun.star.task import ErrorCodeIOException
from com.sun.star.connection import NoConnectException

import cherrypy


FAMILY_TEXT = "Text"
FAMILY_SPREADSHEET = "Spreadsheet"
FAMILY_PRESENTATION = "Presentation"
FAMILY_DRAWING = "Drawing"

FILTER_MAP = {
    "png": {
        FAMILY_PRESENTATION: "impress_png_Export",
        FAMILY_DRAWING: "draw_png_Export"
    },
    "gif": {
        FAMILY_PRESENTATION: "impress_gif_Export",
        FAMILY_DRAWING: "draw_gif_Export"
    },
    "jpg": {
        FAMILY_PRESENTATION: "impress_jpg_Export",
        FAMILY_DRAWING: "draw_jpg_Export"
    },
    "pdf": {
        FAMILY_TEXT: "writer_pdf_Export",
        FAMILY_SPREADSHEET: "calc_pdf_Export",
        FAMILY_PRESENTATION: "impress_pdf_Export",
        FAMILY_DRAWING: "draw_pdf_Export"
    },
    "html": {
        FAMILY_TEXT: "HTML (StarWriter)",
        FAMILY_SPREADSHEET: "HTML (StarCalc)",
        FAMILY_PRESENTATION: "impress_html_Export",
	FAMILY_DRAWING: "draw_html_Export"
    },
    "odt": { FAMILY_TEXT: "writer8" },
    "doc": { FAMILY_TEXT: "MS Word 97" },
    "rtf": { FAMILY_TEXT: "Rich Text Format" },
    "txt": { FAMILY_TEXT: "Text" },
    "ods": { FAMILY_SPREADSHEET: "calc8" },
    "xls": { FAMILY_SPREADSHEET: "MS Excel 97" },
    "odp": { FAMILY_PRESENTATION: "impress8" },
    "ppt": { FAMILY_PRESENTATION: "MS PowerPoint 97" },
    "swf": { FAMILY_PRESENTATION: "impress_flash_Export" },
    "csv": { FAMILY_SPREADSHEET: "Text - txt - csv (StarCalc)" },
    "wiki": { FAMILY_TEXT: "MediaWiki" }
}
# see http://wiki.services.openoffice.org/wiki/Framework/Article/Filter
# for more available filters


class DocumentConversionException(Exception):

    def __init__(self, message):
        self.message = message

    def __str__(self):
        return self.message


class DocumentConverter:
    
    def __init__(self, filename, port=DEFAULT_OPENOFFICE_PORT):
        print port
        print filename
        localContext = uno.getComponentContext()
        resolver = localContext.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", localContext)
        try:
            context = resolver.resolve("uno:socket,host=localhost,port=%s;urp;StarOffice.ComponentContext" % port)
        except NoConnectException:
            print "failed to connect to office"
            os.system("sh refresh.sh")
            sleep(5)
            t = cherryThreadClass(filename)
            t.start()
            #raise DocumentConversionException, "failed to connect to OpenOffice.org on port %s" % port



        self.desktop = context.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", context)

    # Chris Cox, added options
    def convert(self, inputFile, outputFile, **options):

        inputUrl = self._toFileUrl(inputFile)
        outputUrl = self._toFileUrl(outputFile)

        
        document = self.desktop.loadComponentFromURL(inputUrl, "_blank", 0, self._toProperties(Hidden=True))
        try:
          document.refresh()
        except AttributeError:
          pass
        
        outputExt = self._getFileExt(outputFile)
        filterName = self._filterName(document, outputExt)

        try:
            fdata = self._toProperties(**options)
            fdvalue = uno.Any("[]com.sun.star.beans.PropertyValue", fdata)
            document.storeToURL(outputUrl, self._toProperties(FilterName=filterName,FilterData=fdvalue))
        finally:
            document.close(True)

    def _filterName(self, document, outputExt):
        family = self._detectFamily(document)
        try:
            filterByFamily = FILTER_MAP[outputExt]
        except KeyError:
            raise DocumentConversionException, "unknown output format: '%s'" % outputExt
        try:
            return filterByFamily[family]
        except KeyError:
            raise DocumentConversionException, "unsupported conversion: from '%s' to '%s'" % (family, outputExt)
    
    def _detectFamily(self, document):
        if document.supportsService("com.sun.star.text.GenericTextDocument"):
            # NOTE: a GenericTextDocument is either a TextDocument, a WebDocument, or a GlobalDocument
            # but this further distinction doesn't seem to matter for conversions
            return FAMILY_TEXT
        if document.supportsService("com.sun.star.sheet.SpreadsheetDocument"):
            return FAMILY_SPREADSHEET
        if document.supportsService("com.sun.star.presentation.PresentationDocument"):
            return FAMILY_PRESENTATION
        if document.supportsService("com.sun.star.drawing.DrawingDocument"):
            return FAMILY_DRAWING
        raise DocumentConversionException, "unknown document family: %s" % document

    def _getFileExt(self, path):
        ext = splitext(path)[1]
        if ext is not None:
            return ext[1:].lower()

    def _toFileUrl(self, path):
        return uno.systemPathToFileUrl(abspath(path))

    def _toProperties(self, **args):
        props = []
        for key in args:
	    prop = PropertyValue()
	    prop.Name = key
	    prop.Value = args[key]
	    props.append(prop)
        return tuple(props)


def strhex_to_int(option, opt_str, value, parser):
    try:
        colorint=int(value, 16)
	setattr(parser.values, option.dest, colorint)
    except ValueError:
	raise OptionValueError("Option %s needs to be hex string like 0xffffff" % opt_str)

#if __name__ == "__main__":
#    from sys import argv, exit
def start(filename):    
    start=True
    usage = "usage: %prog [options] infile outfile"
    parser = OptionParser(usage)

    # Create text link colors
    backcolor=int("0xffffff", 16)
    textcolor=int("0x000000", 16)
    linkcolor=int("0x0000cc", 16)
    alinkcolor=int("0x0000ee", 16)
    vlinkcolor=int("0x5500cc", 16)

    # Set parse defaults for colors (callbacks not done for defaults)
    parser.set_defaults(BackColor=backcolor, TextColor=textcolor,
        LinkColor=linkcolor, ALinkColor=alinkcolor, VLinkColor=vlinkcolor)
        
    # Impress/Draw HTML DataFilter options
    parser.add_option("--PublishMode", type="int", dest="PublishMode", default=0, help="0=html (default), 1=frames, 2=webcast, 3=kiosk")
    parser.add_option("--IndexURL", dest="IndexURL", default="", help="??")
    parser.add_option("--Format", type="int", dest="Format", default=1, help="0=gif, 1=jpg, 2=png.")
    parser.add_option("--Width", type="int", dest="Width", default=1920, help="Width of output HTML, 1024 means 800 pixel images, 800 means 640 pixel images.")
    parser.add_option("--UseButtonSet", type="int", dest="UseButtonSet", default=3, help="-1 = Text, others are graphical buttons [-1]")
    parser.add_option("--IsExportNotes", action="store_true", dest="IsExportNotes", default=False, help="Set Export Notes")
    parser.add_option("--IsExportContentsPage", action="store_true", dest="IsExportContentsPage", default=False, help="Set Export Contents Page")
    parser.add_option("--Author", dest="Author", default="DocConvert", help="AuthorName")
    parser.add_option("--EMail", dest="EMail", default="No Email", help="E-Mail Address")
    parser.add_option("--HomepageURL", dest="HomepageURL", default="No HomePage", help="Web URL")
    parser.add_option("--UserText", dest="UserText", default="User Text", help="User Text")
    parser.add_option("--EnableDownload", action="store_true", dest="EnableDownload", default=False, help="?? Set Enable Download")
    parser.add_option("--BackColor", dest="BackColor", type="string", action="callback", callback=strhex_to_int, help="HTML Page Background Color, e.g. 0xffffff")
    parser.add_option("--TextColor", dest="TextColor", type="string", action="callback", callback=strhex_to_int, help="HTML Text Color, e.g. 0x000000")
    parser.add_option("--LinkColor", dest="LinkColor", type="string", action="callback", callback=strhex_to_int, help="HTML InActive Link Color, e.g. 0x0000cc")
    parser.add_option("--VLinkColor", dest="VLinkColor", type="string", action="callback", callback=strhex_to_int, help="HTML Visited Link Color, e.g. 0x5500cc")
    parser.add_option("--ALinkColor", dest="ALinkColor", type="string", action="callback", callback=strhex_to_int, help="HTML Active Link Color, e.g. 0x0000ee")
    parser.add_option("--IsUserDocumentColors", dest="IsUserDocumentColors", action="store_true", default=False, help="HTML Set Use Document Colors")
    parser.add_option("--KioskSlideDuration", dest="KioskSlideDuration", type=int, default=20, help="HTML Kiosk Slide Transition Delay [20]")
    parser.add_option("--KioskEndless", dest="KioskEndless", action="store_true", default=False, help="HTML Set Kiosk Endless Play")

    # Draw/Impress Image DataFilter options
    parser.add_option("--PixelWidth", type="int", dest="PixelWidth", default=1024, help="Width of image output. [800]")
    parser.add_option("--PixelHeight", type="int", dest="PixelHeight", default=0, help="Height of image output. [.75 * PixelWidth]")

    # Draw/Impress JPG DataFilter options
    parser.add_option("--Quality", type="int", dest="Quality", default=75, help="JPEG Image Quality Percentage, 100 is best [75]")
    parser.add_option("--ColorMode", type="int", dest="ColorMode", default=0, help="JPEG Color Mode 0=TrueColor 1=GrayScale [0]")

    # Draw/Impress PNG DataFilter options, Compression used in HTML too
    parser.add_option("--Compression", type="int", dest="Compression", default=6, help="PNG Compression 0-9, 9 is highest compression [6]")
    parser.add_option("--Interlaced", dest="Interlaced", action="store_true", default=False, help="Set PNG Interlacing")

    # Draw/Impress GIF DataFilter options, Interlaced used here as well
    parser.add_option("--Translucent", dest="Translucent", default=False, help="Set GIF Translucent")

    (options, args) = parser.parse_args()
    if options.PixelHeight == 0:
        options.PixelHeight=int(.75 * options.PixelWidth)

#    if len(args) != 2:
#        parser.error("incorrect number of arguments")

#    infile=args[0]
#    outfile=args[1]

   # filename="https://dl.dropbox.com/s/ilx8031ubk3cs54/helpshift_whatsapp_v3.pptx"
    print filename
    if (re.search(".pdf",filename)):
#    key=i.name
     type="pdf"
    elif (re.search(".pptx",filename)):
#    key=i.name 
     type="pptx"
    elif (re.search(".ppt",filename)):
#    key=i.name
     type="ppt"
    elif (re.search(".pps",filename)):
     type="pps"
    else:
     print "not valid filetype"
     return

    if os.path.exists('./parselocation/folder'):
        shutil.rmtree('./parselocation/folder')
    os.mkdir("./parselocation/folder")
    os.mkdir("./parselocation/folder/imgfull")
    os.mkdir("./parselocation/folder/imgphone")
    os.mkdir("./parselocation/folder/imgtablet")


    place='./parselocation/static.'+type


    if(re.search("dropbox.com",filename)):
     fileinput=filename+"?dl=1"
    else:
     fileinput=filename

    if not(re.search("./parselocation/",filename)):
        f = urllib2.urlopen(fileinput)
        with open(place, "wb") as code:                                       
            code.write(f.read())
        infile=place
    else:
        infile=filename

    outfile="./parselocation/folder/"
    



    if not isfile(infile):
        print "no such input file: %s" % infile
        exit(1)

    try:
        pdf(infile, outfile)
        ##converter = DocumentConverter(filename)   
        # A way to convert options to a dictionary?
       # temp=vars(options)
       # converter.convert(infile, outfile, **temp)
    except DocumentConversionException, exception:
        print "ERROR!" + str(exception)
        exit(1)
    except ErrorCodeIOException, exception:
        print "ERROR! ErrorCodeIOException %d" % exception.ErrCode
        exit(1)

def pdf(filename, outfile):
    print filename
    print outfile
    os.system("gs -q -dNOPAUSE -dBATCH -sDEVICE=jpeg -r150 -dEPSCrop -sOutputFile="+outfile+"imgfull/img%01d.jpg "+filename)
    os.system("gs -q -dNOPAUSE -dBATCH -sDEVICE=jpeg -r80 -dEPSCrop -sOutputFile="+outfile+"imgphone/img%01d.jpg "+filename)
    os.system("gs -q -dNOPAUSE -dBATCH -sDEVICE=jpeg -r100 -dEPSCrop -sOutputFile="+outfile+"imgtablet/img%01d.jpg "+filename)

    #os.system("gs -q -dNOPAUSE -dBATCH -sDEVICE=jpeg -r150 -dEPSCrop -sOutputFile=img%01d.jpg /Users/sirpunchallot/Desktop/stuff.pdf")
    return True


import threading
import datetime
from time import sleep
import time  
from threading import Thread

globalbool=False
globaltime=time.mktime(time.gmtime())

class cherryThreadClass(threading.Thread):
  def __init__(self, filename):
              threading.Thread.__init__(self)
              self.filename = filename
  def run(self):
        global globalbool
        global globaltime
        globalbool=True
        globaltime=time.mktime(time.gmtime())
        print self.filename+" start"
        start(self.filename);
        globalbool=False

        print self.filename +" done"



class HelloWorld(object):
    def index(self, *vpath, **params):
        infile=params["url"]
        global globalbool
        t = cherryThreadClass(infile)
        if globalbool==False or time.mktime(time.gmtime())>(globaltime+130):
            started=True
            t.start()
        else:
            started=False
        return '{"started":'+str(started).lower()+'}'
    index.exposed = True
    def check(self, *vpath, **params):
        global globalbool
        return '{"started":'+str(globalbool).lower()+',"globaltime":'+str(globaltime).lower()+'}'

    def restartoffice(self, *vpath, **params):
        os.system("sh refresh.sh")
        return '{"status":"restated"}'
    check.exposed = True
    restartoffice.exposed = True

cherrypy.quickstart(HelloWorld())
