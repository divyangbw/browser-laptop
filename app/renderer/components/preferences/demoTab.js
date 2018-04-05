/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const ImmutableComponent = require('../immutableComponent')

const {DefaultSectionTitle} = require('../common/sectionTitle')

class DemoTab extends ImmutableComponent {
  render () {
    return <section>
      <DefaultSectionTitle data-l10n-id='User model logs' />
      {
        (this.props.demoValue || []).map(item => {
          return <div style={{marginBottom: '15px'}}>
            <div>
              {item.time}: <span style={{fontWeight: 'bold'}}>{item.eventName}</span>
            </div>
            <pre style={{paddingLeft: '10px', wordWrap: 'break-word', whiteSpace: 'pre-wrap'}}>
              {JSON.stringify(item.data, null, 2)}
            </pre>
          </div>
        })
      }
    </section>
  }
}

module.exports = DemoTab