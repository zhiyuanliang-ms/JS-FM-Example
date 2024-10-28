import { ApplicationInsights } from '@microsoft/applicationinsights-web'
const appInsights = new ApplicationInsights({ config: {
  connectionString: "YOUR-CONNECTION-STRING"
}});
appInsights.loadAppInsights();

import logo from './logo.svg';
import './App.css';

import { load } from "@azure/app-configuration-provider";
import { FeatureManager, ConfigurationObjectFeatureFlagProvider } from "@microsoft/feature-management";
import { createTelemetryPublisher } from "@microsoft/feature-management-applicationinsights-browser";
import { useEffect, useState } from 'react';

function App() {
  const [isBetaEnabled, setIsBetaEnabled] = useState(null);

  const fetchData = async () => {
    const appConfig = await load(
      "YOUR-CONNECTION-STRING",
      {
        featureFlagOptions: {
          enabled: true,
          // Note: selectors must be explicitly provided for feature flags.
          selectors: [{
              keyFilter: "*"
          }]
        }
      }
    );
    console.log(appConfig.get("test"));
    // const ffp = new ConfigurationMapFeatureFlagProvider(appConfig);

    const jsonConfig = {
      "feature_management": {
          "feature_flags": [
            {
              "id": "Beta",
              "enabled": true,
              "telemetry": {
                "enabled": true
              }
            }
          ]
      }
    };
    const ffp = new ConfigurationObjectFeatureFlagProvider(jsonConfig);

    const sendTelemetry = createTelemetryPublisher(appInsights);
    const fm = new FeatureManager(
      ffp,
      {onFeatureEvaluated: sendTelemetry}
    );
  
    setIsBetaEnabled(await fm.isEnabled("Beta"));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <p>Beta feature flag is {isBetaEnabled === null ? 'loading...' : isBetaEnabled ? 'enabled' : 'disabled'}.</p>
        </div>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
