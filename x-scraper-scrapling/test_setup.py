#!/usr/bin/env python3
"""
Test script to verify X.com Scraper setup
"""

import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import fastapi
        print("✓ fastapi")
    except ImportError as e:
        print(f"✗ fastapi: {e}")
        return False
    
    try:
        import uvicorn
        print("✓ uvicorn")
    except ImportError as e:
        print(f"✗ uvicorn: {e}")
        return False
    
    try:
        import sqlalchemy
        print("✓ sqlalchemy")
    except ImportError as e:
        print(f"✗ sqlalchemy: {e}")
        return False
    
    try:
        from scrapling.fetchers import StealthyFetcher
        print("✓ scrapling")
    except ImportError as e:
        print(f"✗ scrapling: {e}")
        return False
    
    try:
        import apscheduler
        print("✓ apscheduler")
    except ImportError as e:
        print(f"✗ apscheduler: {e}")
        return False
    
    try:
        import dotenv
        print("✓ python-dotenv")
    except ImportError as e:
        print(f"✗ python-dotenv: {e}")
        return False
    
    try:
        import pydantic
        print("✓ pydantic")
    except ImportError as e:
        print(f"✗ pydantic: {e}")
        return False
    
    return True


def test_database():
    """Test database setup"""
    print("\nTesting database setup...")
    
    try:
        from database import init_db, engine
        from models import Base
        
        init_db()
        print("✓ Database initialized successfully")
        return True
    except Exception as e:
        print(f"✗ Database setup failed: {e}")
        return False


def test_models():
    """Test SQLAlchemy models"""
    print("\nTesting models...")
    
    try:
        from models import Account, Tweet, ScrapeLog
        print("✓ All models imported successfully")
        return True
    except Exception as e:
        print(f"✗ Models import failed: {e}")
        return False


def test_scraper():
    """Test scraper initialization"""
    print("\nTesting scraper...")
    
    try:
        from scraper import XComScraper
        scraper = XComScraper()
        print("✓ Scraper initialized successfully")
        scraper.close()
        return True
    except Exception as e:
        print(f"✗ Scraper initialization failed: {e}")
        return False


def test_scheduler():
    """Test scheduler setup"""
    print("\nTesting scheduler...")
    
    try:
        from scheduler import init_scheduler, get_scheduler_status
        scheduler = init_scheduler()
        status = get_scheduler_status()
        print(f"✓ Scheduler initialized (running: {status['running']})")
        return True
    except Exception as e:
        print(f"✗ Scheduler initialization failed: {e}")
        return False


def test_fastapi_app():
    """Test FastAPI app"""
    print("\nTesting FastAPI app...")
    
    try:
        from main import app
        print("✓ FastAPI app created successfully")
        print(f"  Routes: {len(app.routes)} endpoints registered")
        return True
    except Exception as e:
        print(f"✗ FastAPI app creation failed: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("X.com Scraper Setup Test")
    print("=" * 60)
    print()
    
    tests = [
        ("Imports", test_imports),
        ("Database", test_database),
        ("Models", test_models),
        ("Scraper", test_scraper),
        ("Scheduler", test_scheduler),
        ("FastAPI", test_fastapi_app),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ {name} test crashed: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your setup is ready.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
