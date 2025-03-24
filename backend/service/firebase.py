import firebase_admin
from firebase_admin import credentials, firestore , db , auth


# Loads the Firebase service account key from the Json file
cred = credentials.Certificate("serviceAccountKey.json")
#Initializes Firebase using the provided credentials.
firebase_admin.initialize_app(cred , {
    "databaseURL": "https://randomchat-c08b6-default-rtdb.asia-southeast1.firebasedatabase.app/"
})



# Creates a reference to the Firestore database, allowing us to read and write data
firestore_db = firestore.client()

realtime_db = db.reference("/")

firebase_auth = auth



