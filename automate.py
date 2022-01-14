from selenium import webdriver
from random import random
import urllib
import os
import glob
import time

browser = webdriver.Firefox()

def count():
	return len(glob.glob(os.path.expanduser("~") + "/Downloads/bezier-flow*.png"))


for i in range(0, 60):
	tot_time = 0
	curr = count()
	print(curr)

	loc = "localhost:8000"

	browser.get(loc)


	time.sleep(20)
	tot_time += 20

	while(count() < curr+7 or tot_time > 600):
		print("Process has been running for " + str(tot_time) + " seconds...")
		time.sleep(10)
		tot_time += 10

	print("Finished " + str(i + 1) + " bezier flow")

	#buffer time to wrap up any ongoing processes
	time.sleep(10)


browser.close()

