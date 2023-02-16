import '@/styles/globals.css'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { ChainId } from '@thirdweb-dev/sdk'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={ChainId.Goerli}>
      <Component {...pageProps} />
    </ThirdwebProvider>
  )
}
