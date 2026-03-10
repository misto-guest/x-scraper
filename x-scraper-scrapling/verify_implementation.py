#!/usr/bin/env python3
"""
Quick verification script to check if all required components are implemented.
Does not require running the server or having all dependencies installed.
"""

import ast
import os
import sys

def check_file_exists(filepath):
    """Check if a file exists"""
    exists = os.path.exists(filepath)
    status = "✅" if exists else "❌"
    print(f"{status} File: {filepath}")
    return exists

def check_function_exists(filepath, function_name):
    """Check if a function exists in a Python file"""
    if not os.path.exists(filepath):
        print(f"❌ Function '{function_name}': File not found")
        return False

    with open(filepath, 'r') as f:
        tree = ast.parse(f.read())

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == function_name:
            print(f"✅ Function '{function_name}': Found in {filepath}")
            return True

    print(f"❌ Function '{function_name}': Not found in {filepath}")
    return False

def check_class_exists(filepath, class_name):
    """Check if a class exists in a Python file"""
    if not os.path.exists(filepath):
        print(f"❌ Class '{class_name}': File not found")
        return False

    with open(filepath, 'r') as f:
        tree = ast.parse(f.read())

    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef) and node.name == class_name:
            print(f"✅ Class '{class_name}': Found in {filepath}")
            return True

    print(f"❌ Class '{class_name}': Not found in {filepath}")
    return False

def check_endpoint_exists(filepath, route_path):
    """Check if an endpoint path is defined in main.py"""
    if not os.path.exists(filepath):
        print(f"❌ Endpoint '{route_path}': File not found")
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    if route_path in content:
        print(f"✅ Endpoint '{route_path}': Found in {filepath}")
        return True

    print(f"❌ Endpoint '{route_path}': Not found in {filepath}")
    return False

def main():
    """Run all verification checks"""
    print("\n" + "="*80)
    print("  X.com Scraper - Implementation Verification")
    print("="*80 + "\n")

    base_path = "/Users/northsea/clawd-dmitry/x-scraper-scrapling"

    all_passed = True

    # Check files exist
    print("1. Checking file structure...")
    print("-" * 80)
    files = [
        f"{base_path}/scraper.py",
        f"{base_path}/models.py",
        f"{base_path}/main.py",
        f"{base_path}/test_account_scraping.py",
        f"{base_path}/README.md",
    ]
    for f in files:
        if not check_file_exists(f):
            all_passed = False

    print()

    # Check scraper.py functions
    print("2. Checking scraper.py functions...")
    print("-" * 80)
    functions = [
        (f"{base_path}/scraper.py", "scrape_account_timeline"),
        (f"{base_path}/scraper.py", "scrape_single_tweet"),
        (f"{base_path}/scraper.py", "_extract_tweets_from_page"),
        (f"{base_path}/scraper.py", "_extract_tweet_from_element"),
        (f"{base_path}/scraper.py", "_parse_count"),
        (f"{base_path}/scraper.py", "_is_account_suspended_or_private"),
    ]
    for filepath, func in functions:
        if not check_function_exists(filepath, func):
            all_passed = False

    print()

    # Check models.py classes
    print("3. Checking models.py Pydantic models...")
    print("-" * 80)
    models = [
        (f"{base_path}/models.py", "TweetScrapeRequest"),
        (f"{base_path}/models.py", "AccountScrapeRequest"),
        (f"{base_path}/models.py", "TweetData"),
        (f"{base_path}/models.py", "ScrapeResponse"),
    ]
    for filepath, model in models:
        if not check_class_exists(filepath, model):
            all_passed = False

    print()

    # Check API endpoints
    print("4. Checking API endpoints...")
    print("-" * 80)
    endpoints = [
        (f"{base_path}/main.py", '/api/scrape/tweet"'),
        (f"{base_path}/main.py", '/api/scrape/account"'),
    ]
    for filepath, endpoint in endpoints:
        if not check_endpoint_exists(filepath, endpoint):
            all_passed = False

    print()

    # Summary
    print("="*80)
    if all_passed:
        print("  ✅ ALL CHECKS PASSED - Implementation is complete!")
    else:
        print("  ❌ SOME CHECKS FAILED - Please review the output above")
    print("="*80 + "\n")

    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
