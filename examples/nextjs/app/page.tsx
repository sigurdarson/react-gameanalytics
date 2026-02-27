'use client'

import { useGameAnalytics, useRemoteConfig } from 'react-gameanalytics/next'

export default function HomePage() {
  const ga = useGameAnalytics()
  const ctaText = useRemoteConfig('cta_button_text', 'Get Started')

  return (
    <div>
      <h2>Home</h2>
      <p>This is the landing page. Test design events, remote configs, and ad events below.</p>

      <h3>Design Events</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          onClick={() => ga.addDesignEvent({ eventId: 'ui:cta:hero_clicked' })}
          style={{ padding: '8px 16px' }}
        >
          {ctaText}
        </button>

        <button
          onClick={() => ga.addDesignEvent({ eventId: 'feature:search:executed', value: 23 })}
          style={{ padding: '8px 16px' }}
        >
          Search (23 results)
        </button>
      </div>

      <h3 style={{ marginTop: 16 }}>Ad Events</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() =>
            ga.addAdEvent({
              adAction: 'show',
              adType: 'banner',
              adSdkName: 'google_adsense',
              adPlacement: 'homepage_footer',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Show Banner Ad
        </button>

        <button
          onClick={() =>
            ga.addAdEvent({
              adAction: 'clicked',
              adType: 'banner',
              adSdkName: 'google_adsense',
              adPlacement: 'homepage_footer',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Click Banner Ad
        </button>

        <button
          onClick={() =>
            ga.addAdEvent({
              adAction: 'rewardReceived',
              adType: 'rewardedVideo',
              adSdkName: 'admob',
              adPlacement: 'unlock_report',
              duration: 30,
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Rewarded Video Complete
        </button>

        <button
          onClick={() =>
            ga.addAdEvent({
              adAction: 'failedShow',
              adType: 'interstitial',
              adSdkName: 'admob',
              adPlacement: 'between_pages',
              noAdReason: 'noFill',
            })
          }
          style={{ padding: '8px 16px' }}
        >
          Ad Failed (No Fill)
        </button>
      </div>
    </div>
  )
}
