import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from .database import AsyncSessionLocal, engine
from .models import Role, Plant, User
from .auth.utils import get_password_hash

async def seed_data():
    async with AsyncSessionLocal() as db:
        # 1. Seed Plants
        plants_data = [
            {"name": "Pattikonda Solar Plant", "code": "PKD", "region": "Andhra Pradesh", "location_lat": 15.4200, "location_lng": 77.4100},
            {"name": "Hindupur Solar Plant", "code": "HNP", "region": "Andhra Pradesh", "location_lat": 13.8200, "location_lng": 77.4900},
            {"name": "Ananthapur Solar Plant", "code": "ATP", "region": "Andhra Pradesh", "location_lat": 14.6819, "location_lng": 77.6006},
        ]

        created_plants = []
        for p in plants_data:
            stmt = select(Plant).where(Plant.code == p["code"])
            existing = (await db.execute(stmt)).scalar()
            if not existing:
                plant_obj = Plant(**p)
                db.add(plant_obj)
                created_plants.append(plant_obj)
            else:
                created_plants.append(existing)
        
        await db.commit() # Ensure plants have IDs

        # 2. Seed Admin User
        stmt = select(User).where(User.email == "admin@acmesolar.com")
        admin_user = (await db.execute(stmt)).scalar()
        if not admin_user:
            admin_user = User(
                fullname="HSE Admin",
                email="admin@acmesolar.com",
                hashed_password=get_password_hash("admin123"),
                role_id=1, 
            )
            db.add(admin_user)
            await db.commit()
        
        # 3. Seed Sample Events
        from .models import Event
        stmt = select(Event).limit(1)
        existing_event = (await db.execute(stmt)).scalar()
        if not existing_event:
            # Map codes to objects for reliable ID retrieval
            plant_map = {p.code: p.id for p in created_plants}
            
            sample_events = [
                {
                    "plant_id": plant_map.get("PKD"),
                    "reporter_id": admin_user.id,
                    "event_type": "Unsafe Condition",
                    "risk_level": "Medium",
                    "impact_nature": "Fire Hazard",
                    "description": "Loose wiring detected in Inverter Room 4. Needs immediate cable dressing.",
                    "status": "Open"
                },
                {
                    "plant_id": plant_map.get("HNP"),
                    "reporter_id": admin_user.id,
                    "event_type": "Near Miss",
                    "risk_level": "High",
                    "impact_nature": "Fall from height",
                    "description": "Scaffolding at Block 2 was found without proper base plates during inspection.",
                    "status": "Open"
                }
            ]
            for e in sample_events:
                if e["plant_id"]: # Only add if plant was found/created
                    db.add(Event(**e))
        
        await db.commit()
        print("Database seeded with dynamic ID mapping.")

if __name__ == "__main__":
    from sqlalchemy import select
    asyncio.run(seed_data())

if __name__ == "__main__":
    from sqlalchemy import select
    asyncio.run(seed_data())
