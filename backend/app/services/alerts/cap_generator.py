from datetime import datetime, timezone
from xml.sax.saxutils import escape
from typing import Dict, Any

def generate_cap_xml(advisory: Dict[str, Any], region: Dict[str, Any]) -> str:
    """
    Generate OASIS Common Alerting Protocol (CAP-v1.2) compliant XML.
    Standardized for NDMA / MoES early warning systems.
    """
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S+00:00")
    identifier = advisory.get("bulletinId", f"IMD-FF-{int(datetime.now().timestamp())}")
    severity = "Extreme" if "RED" in advisory.get("riskLevel", "") else "Severe" if "ORANGE" in advisory.get("riskLevel", "") else "Moderate" if "YELLOW" in advisory.get("riskLevel", "") else "Minor"

    actions_text = "\n".join([f"- {a['action']}" for a in advisory.get("suggestedActions", [])])

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>{escape(identifier)}</identifier>
  <sender>imd-forecastfusion@moes.gov.in</sender>
  <sent>{now_iso}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>{escape(advisory.get("riskLevel", "Weather Advisory"))}</event>
    <urgency>Expected</urgency>
    <severity>{severity}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>IMD-NWP-Ensemble</valueName>
      <value>Bayesian-BMA-v2.6</value>
    </eventCode>
    <expires>{advisory.get("timeValidity", "Next 24-36h")}</expires>
    <headline>{escape(advisory.get("summaryEn", ""))}</headline>
    <description>{escape(advisory.get("summaryEn", ""))}</description>
    <instruction>{escape(actions_text)}</instruction>
    <area>
      <areaDesc>{escape(region.get("name", "India Forecast Zone"))}, {escape(region.get("state", ""))}</areaDesc>
      <circle>{region.get("lat", 0.0)},{region.get("lng", 0.0)},50.0</circle>
    </area>
  </info>
</alert>"""
    return xml.strip()
