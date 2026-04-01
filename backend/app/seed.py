import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from .database import AsyncSessionLocal, engine
from .models import Role, Plant, User
from .auth.utils import get_password_hash

async def seed_data():
    async with AsyncSessionLocal() as db:
        # 1. Seed Roles (if not already handled by schema.sql)
        roles_data = [
            {"name": "Corporate", "description": "Full access to all plants and corporate reporting"},
            {"name": "Plant Head", "description": "Management access to specific plant HSE data"},
            {"name": "EHS Officer", "description": "Execution access for audits and incident reporting"},
            {"name": "Site User", "description": "Basic reporting access"},
        ]
        
        # 2. Seed Plants (Mentioned in the prompt)
        plants_data = [
            {"name": "Pattikonda Solar Plant", "code": "PKD", "region": "Andhra Pradesh", "location_lat": 15.4200, "location_lng": 77.4100},
            {"name": "Hindupur Solar Plant", "code": "HNP", "region": "Andhra Pradesh", "location_lat": 13.8200, "location_lng": 77.4900},
            {"name": "Ananthapur Solar Plant", "code": "ATP", "region": "Andhra Pradesh", "location_lat": 14.6819, "location_lng": 77.6006},
        ]

        # In a real environment, we'd check for existence first.
        # This is a one-time setup for the "One Day" challenge.
        for plant in plants_data:
            new_plant = Plant(**plant)
            db.add(new_plant)
        
        # Seed an admin user
        admin_user = User(
            fullname="HSE Admin",
            email="admin@acmesolar.com",
            hashed_password=get_password_hash("admin123"),
            role_id=1, # Corporate
        )
        db.add(admin_user)
        
        await db.commit()
        print("Database seeded successfully with Plants and Admin User.")

if __name__ == "__main__":
    asyncio.run(seed_data())
