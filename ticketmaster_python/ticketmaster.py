import sys
import requests
from geolib import geohash
from flask import request

tm_key = "200YbhNbPdkoJdJnvDUKb0UKNbLmg4d6"
# print(geohash.encode('33.9994','-118.2133',7))
baseurl = "https://app.ticketmaster.com/discovery/v2/events.json"
detailurl = "https://app.ticketmaster.com/discovery/v2/events"
venueurl = "https://app.ticketmaster.com/discovery/v2/venues"

cat_dict={'music':'KZFzniwnSyZfZ7v7nJ', 'sports':'KZFzniwnSyZfZ7v7nE', 'artstheatre':'KZFzniwnSyZfZ7v7na', 'film':'KZFzniwnSyZfZ7v7nn', 'mix':'KZFzniwnSyZfZ7v7n1','all':''}

def fetch_para():
    raw_args = request.args
    print(raw_args)
    keyword_arg = raw_args.get('ke')
    seg_arg = cat_dict[raw_args.get('ca')]
    radius_arg = raw_args.get('ra') or 10
    unit_arg = 'miles'
    geopoint_arg = geohash.encode(raw_args.get('la'),raw_args.get('lo'),7)
    req_para = {'apikey':tm_key, 'keyword':keyword_arg, 'segmentId':seg_arg, 'radius':radius_arg, 'unit':unit_arg, 'geoPoint':geopoint_arg}
    print(req_para)
    return req_para

def fetch_event():
    req_header = {
        'Content-Type': 'application/json'
    }
    req_para = fetch_para()
    r = requests.get(baseurl, params=req_para, headers=req_header)
    return r.json()

def fetch_detail():
    id_arg = request.args.get('event_id')
    print(id_arg)
    req_header = {
        'Content-Type': 'application/json'
    }
    r = requests.get(f'{detailurl}/{id_arg}?apikey={tm_key}&', headers=req_header)
    return r.json()

def fetch_venue():
    vn_arg = request.args.get('venue_name')
    vn_arg = vn_arg.replace(' ','%')
    print(vn_arg)
    req_header = {
        'Content-Type': 'application/json'
    }
    r = requests.get(f'{venueurl}?apikey={tm_key}&keyword={vn_arg}', headers=req_header)
    return r.json()
