import React, {useState} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useColorMode} from '@docusaurus/theme-common';
import styles from './styles.module.css';

const INSTALL_CMD = 'yarn add mobx-chunk';

const Hero: React.FC = () => {
  const {colorMode} = useColorMode();
  const docsUrl = useBaseUrl('/docs/intro');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.title}>
          Make&nbsp;your&nbsp;components<br/>more&nbsp;interactable
        </h1>

        <p className={styles.subtitle}>
          A performant, easy to use <strong>hold&nbsp;to&nbsp;open context menu</strong>{' '}
          for React&nbsp;Native powered by Reanimated.
        </p>

        <div className={styles.actions}>
          <a
            href={docsUrl}
            className={clsx(
              'button button--lg',
              colorMode === 'dark' ? 'button--info' : 'button--primary'
            )}
          >
            Get Started
          </a>

          <div className={styles.installBlock}>
            <code className={styles.installText}>{INSTALL_CMD}</code>
            <button
              aria-label="Copy install command"
              className={styles.copyBtn}
              onClick={handleCopy}
            >
              {copied ? (
                <svg viewBox="0 0 24 24">
                  <path d="M20.3 6.7l-11 11-5-5 1.4-1.4 3.6 3.6 9.6-9.6z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
