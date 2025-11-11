# backend/app/models/user.py
"""
Modelos de usuario con SQLAlchemy
"""
from sqlalchemy import Column, Integer, String, Boolean, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")  # admin, programmer, user
    pw_hash = Column(String, nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    modules = Column(JSON, nullable=False, default=list)  # ['Mapito']

    def has_module(self, module_code: str) -> bool:
        """Verificar si usuario tiene acceso a módulo"""
        if self.role == "admin":
            return True
        return module_code in (self.modules or [])

    def to_dict(self):
        """Serializar a dict para JWT"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "active": self.active,
            "modules": self.modules or []
        }

class Module(Base):
    __tablename__ = "modules"

    code = Column(String, primary_key=True)  # 'Mapito'
    title = Column(String, nullable=False)
    description = Column(String)
    enabled = Column(Boolean, nullable=False, default=True)
