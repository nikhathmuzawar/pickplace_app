from pymongo import MongoClient

client = MongoClient("mongodb+srv://user1:test1234!@cluster0.smhr6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

db = client.devices
collection_name = db["devices"]