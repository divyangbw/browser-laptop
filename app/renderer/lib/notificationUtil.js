/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const notifier = require('brave-node-notifier')
const os = require('os')

// Actions
const appActions = require('../../../js/actions/appActions')

// Constants
const notificationTypes = require('../../common/constants/notificationTypes')

// Utils
const immutableUtil = require('../../common/state/immutableUtil')

const notificationUtil = {
  onClick: null,
  createNotification: (options) => {
    if (!options) {
      return
    }

    options = immutableUtil.makeJS(options)

    if (!options.title) {
      console.log('Title is not provided for the notification')
      return
    }

    const type = os.type()
    let extras = {
      Linux: () => {
        // TBD: add NotifySend() options here
      },

      // Terminal.icns has been updated!
      Darwin: () => {
        if (notifier.utils.isMountainLion()) {
          return {
            actions: 'View',
            closeLabel: 'Close'
          }
        }
      },

      Windows_NT: () => {
        if (!notifier.utils.isLessThanWin8()) {
          return {
            appID: 'com.squirrel.brave.Brave'
          }
        }
      }
    }[type]

    if (extras) extras = extras()
    if (!extras) {
      console.error('notifications not supported')
      return
    }

    if (!notificationUtil.onClick) {
      notificationUtil.onClick = notifier.on('click', function (notifierObject, options) {
        if (typeof options === 'object' && options.data) {
          notificationUtil.clickHandler(options)
        }
      })

      notifier.on('timeout', () => {
        if (typeof options === 'object' && options.data) {
          notificationUtil.timeoutHandler(options)
        }
      })
    }

    notifier.notify(Object.assign(options, extras), function () {
      let result = arguments[2] && arguments[2].activationType

      if (!result && arguments[1]) {
        result = {
          'the user clicked on the toast.': 'clicked',
          'the toast has timed out': 'timeout',
          'the user dismissed this toast': 'closed'
        }[arguments[1]]
      }

      if (result === 'closed') {
        appActions.onUserModelLog('User closed the ad')
      }
    })
  },

  clickHandler: (options) => {
    const data = options.data

    switch (data.notificationId) {
      case notificationTypes.ADS:
        {
          appActions.createTabRequested({
            url: data.notificationUrl,
            windowId: data.windowId
          })
          appActions.onUserModelLog('User clicked on ad', {notificationUrl: data.notificationUrl})
          break
        }
    }
  },

  timeoutHandler: (options) => {
    const data = options.data

    switch (data.notificationId) {
      case notificationTypes.ADS:
        {
          appActions.onUserModelLog('Ad timeout', {notificationUrl: data.notificationUrl})
          break
        }
    }
  }
}

module.exports = notificationUtil