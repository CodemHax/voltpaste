from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None
    collection = None

db_instance = Database()

async def connect_db():
    db_instance.client = AsyncIOMotorClient(settings.mongo_uri)
    db_instance.db = db_instance.client[settings.db_name]
    db_instance.collection = db_instance.db[settings.collection_name]
    await db_instance.collection.create_index("id", unique=True)
    await db_instance.collection.create_index("expires_at", expireAfterSeconds=0)

async def disconnect_db():
    if db_instance.client:
        db_instance.client.close()

def get_collection():
    return db_instance.collection
