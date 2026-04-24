import time
from playwright.sync_api import sync_playwright

def main():
    print("Welcome to the Amazon Fresh/Whole Foods Auto-Cart tool.")
    print("This script will open a browser. Please log in to your Amazon account if prompted.")
    
    ingredients = []
    try:
        with open('ingredients.txt', 'r') as f:
            ingredients = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print("Could not find 'ingredients.txt'. Please create this file with one ingredient per line.")
        return

    if not ingredients:
        print("No ingredients found in 'ingredients.txt'.")
        return

    with sync_playwright() as p:
        # Launch browser in non-headless mode so user can see and pass captchas/logins
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Go to Amazon Fresh storefront (can be changed to Whole Foods URL)
        page.goto("https://www.amazon.com/alm/storefront?almBrandId=QW1hem9uIEZyZXNo")
        
        print("Please ensure you are logged in and your delivery address/store is set correctly.")
        print("Waiting 15 seconds for you to verify login/captcha if needed...")
        time.sleep(15)

        for item in ingredients:
            print(f"Searching for: {item}")
            try:
                # Fill the search bar
                page.fill('input[name="field-keywords"]', item)
                page.click('input#nav-search-submit-button')
                page.wait_for_load_state('networkidle')
                
                # Wait briefly for search results to render
                page.wait_for_selector('.s-result-item', timeout=5000)
                
                # Specifically for amazon fresh, "Add to Cart" buttons can vary. 
                # We attempt to select the first visible add to cart input/button.
                add_button = page.locator('button:has-text("Add to Cart"), input[name="submit.addToCart"]').first
                
                if add_button.is_visible(timeout=3000):
                    add_button.click()
                    print(f"✓ Added {item} to cart!")
                    time.sleep(1.5) # Allow the mini-cart animation to finish
                else:
                    print(f"✗ Could not find an obvious 'Add to Cart' button for {item}. You may need to add it manually.")
            except Exception as e:
                print(f"Error adding {item}: {str(e)}")

        print("Finished adding items to your cart!")
        print("Please verify the contents of your cart in the browser.")
        input("Press Enter to close the browser and exit...")
        browser.close()

if __name__ == "__main__":
    main()
