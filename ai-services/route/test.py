import os
import dotenv

dotenv.load_dotenv()

print(os.getenv("api_key"))