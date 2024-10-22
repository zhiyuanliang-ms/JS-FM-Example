"use client"; // Add this at the top of your component file

import { ApplicationInsights } from '@microsoft/applicationinsights-web'

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from 'react';
import { load } from "@azure/app-configuration-provider";
import { FeatureManager, ConfigurationMapFeatureFlagProvider, ConfigurationObjectFeatureFlagProvider } from "@microsoft/feature-management";
import { createTelemetryPublisher } from "@microsoft/feature-management-applicationinsights-browser";

export default function Home() {
  const [isBetaEnabled, setIsBetaEnabled] = useState(null);

  const appInsights = new ApplicationInsights({ config: {
    connectionString: "InstrumentationKey=1ed14b85-2501-4762-a20e-1b8339da0cd5;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=a4b55d1c-c833-4ca9-869e-e4bf8d1ecd4e"
  }});
  appInsights.loadAppInsights();

  const fetchData = async () => {
    // appInsights.trackPageView({name: "Home"});
    // const appConfig = await load(
    //   "Endpoint=https://zhiyuanliang-test.azconfig-test.io;Id=c0EH;Secret=45T6yvK386A2UfVUFjNDGHDgTGzpsbWOWlt5Pvj5s9orLAS9jsGLJQQJ99AJADLArgHeHiRoAAACAZACTX4k",
    //   // "Endpoint=https://appconfig-lzy-dev.azconfig.io;Id=1IOH;Secret=90rsYJ0WOCQENkJVAhhjXE6f0DihG9EqAJA3UUIWIoKvqCzGVjJJJQQJ99AJAC3pKaRJhn2FAAACAZAC6iVX",
    //   {
    //     featureFlagOptions: {
    //       enabled: true,
    //       // Note: selectors must be explicitly provided for feature flags.
    //       selectors: [{
    //           keyFilter: "*"
    //       }]
    //     }
    //   }
    // );
    // console.log(appConfig);
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
    <div className={styles.page}>
      <main className={styles.main}>
        <p>Beta feature flag is {isBetaEnabled === null ? 'loading...' : isBetaEnabled ? 'enabled' : 'disabled'}.</p>
        <Image
          className={styles.logo}
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="https://nextjs.org/icons/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
