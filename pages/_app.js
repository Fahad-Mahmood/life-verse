import { useState } from 'react';
import Script from 'next/script';
import { CallProvider } from '../src/providers/CallProvider';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const [engageDigital, setEngageDigital] = useState(null);
  return (
    <>
    <CallProvider engageDigitalPkg={engageDigital}>
       <Component engageDigital={engageDigital} {...pageProps} />
    </CallProvider>
    <Script
        src="/engagesdk.js"
        strategy="afterInteractive"
        onLoad={() =>setEngageDigital(window.EngageDigital)}
      />
  </>
  );
}

export default MyApp
