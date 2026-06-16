import re
import urllib.request
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def fetch_and_parse_feed():
    try:
        # Fetch the XML feed data
        req = urllib.request.Request(
            FEED_URL, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()

        # Parse the XML
        root = ET.fromstring(xml_data)
        ns = "{http://www.w3.org/2005/Atom}"
        
        entries = root.findall(f"{ns}entry")
        updates = []
        
        for entry in entries:
            # Extract basic metadata
            title = entry.find(f"{ns}title")
            date_str = title.text.strip() if title is not None else "Unknown Date"
            
            updated = entry.find(f"{ns}updated")
            updated_str = updated.text.strip() if updated is not None else ""
            
            content_elem = entry.find(f"{ns}content")
            if content_elem is None or not content_elem.text:
                continue
                
            content_xml = content_elem.text
            
            # Split the entry's HTML content by <h3> headers to extract individual release notes
            # e.g., "<h3>Feature</h3>\n<p>description</p>"
            parts = re.split(r'<h3>(.*?)</h3>', content_xml)
            
            if len(parts) > 1:
                # Loop through the type & body pairs
                for i in range(1, len(parts), 2):
                    update_type = parts[i].strip()
                    update_body = parts[i+1].strip() if i+1 < len(parts) else ""
                    
                    updates.append({
                        "date": date_str,
                        "updated_iso": updated_str,
                        "type": update_type,
                        "body": update_body
                    })
            else:
                # Fallback if no <h3> tags are present
                updates.append({
                    "date": date_str,
                    "updated_iso": updated_str,
                    "type": "Update",
                    "body": content_xml.strip()
                })
                
        return updates, None
    except Exception as e:
        return [], str(e)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/releases")
def get_releases():
    releases, error = fetch_and_parse_feed()
    if error:
        return jsonify({"success": False, "error": error}), 500
    return jsonify({"success": True, "releases": releases})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
