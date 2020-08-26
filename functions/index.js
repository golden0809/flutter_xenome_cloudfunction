const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

exports.sendNotification = functions.firestore
  .document('ActivityFeed/{postUid}')
  .onCreate((snap, context) => {
    console.log('----------------start function--------------------')

    const doc = snap.data()
    console.log(doc)

    // const uid = doc.uid
    // const postUid = doc.postUid
    const uid = 'BiOJh0FOktQ9FHtOUaomE9SDOBk1'
    const postUid = 'QHW8Q1Hru9ebM8B13vRBflI5LFl2'
    const contentMessage = doc.content
    const xmapName = doc.xmapName
    const type = doc.type
    var message = ''

    // pushToken = 'f_zg6MJd-r4:APA91bEnuo0Hn1ubvV_apuvQc2yj6nL5BJiZdhAEI269b1Gy4eD03Ubx8RNWWiuF0Nl9X7Zrt0-Ec526-CF6pkSpwNTd9dMvnCXKZmZb1mZ-c9Ln6owDWW_jnbnDrowS40O4SjxVYpxo'
    // const payload = {
    //     notification: {
    //       title: `You have a message from "`,
    //       body: message,
    //       badge: '1',
    //       sound: 'default'
    //     }
    //   }
    // admin
    //                 .messaging()
    //                 .sendToDevice(pushToken, payload)
    //                 .then(response => {
    //                   console.log('Successfully sent message:', response)
    //                 })
    //                 .catch(error => {
    //                   console.log('Error sending message:', error)
    //                 })

    admin
      .firestore()
      .collection('Users')
      .where('uid', '==', postUid)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(userTo => {
          console.log(`Found user to: ${userTo.data().tellusname}`)
          if (userTo.data().pushToken ) {
            // Get info user from (sent)
            admin
              .firestore()
              .collection('Users')
              .where('uid', '==', uid)
              .get()
              .then(querySnapshot2 => {
                querySnapshot2.forEach(userFrom => {
                  console.log(`Found user from: ${userFrom.data().tellusname}`)
                  if(type == 'reply') {
                     message = `"${userFrom.data().tellusname}" replied to you on `+ xmapName + `: `+ contentMessage
                  }else if(type == 'aPageComment'){
                    message = `"${userFrom.data().tellusname}" has commented on a page with in `+ xmapName 
                  }else{
                    message = 'empty'
                  }
                  const payload = {
                    notification: {
                      title: `You have a message from "${userFrom.data().tellusname}"`,
                      body: message,
                      badge: '1',
                      sound: 'default'
                    }
                  }
                  // Let push to the target device
                  admin
                    .messaging()
                    .sendToDevice(userTo.data().pushToken, payload)
                    .then(response => {
                      console.log('Successfully sent message:', response)
                    })
                    .catch(error => {
                      console.log('Error sending message:', error)
                    })
                })
              })
          } else {
            console.log('Can not find pushToken target user')
          }
        })
      })
    return null
  })