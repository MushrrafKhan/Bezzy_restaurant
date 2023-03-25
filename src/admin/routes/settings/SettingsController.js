const {
    models: {AdminSettings, Subscription}
} = require('../../../../lib/models');

class SettingsController {

        async settingsPage(req, res) {
            let setting = await AdminSettings.findOne({});
            console.log('========='+setting+'================')
            return res.render('setting', {setting});
        }

        async settingsUpdate(req, res) {    
            console.log('=========update================')   
            const {
                androidAppVersion,
                androidForceUpdate,
                iosAppVersion,
                iosForceUpdate,
                radius,
                alert_live_number,
                hours_alert_delete     
            } = req.body;
            
            await AdminSettings.updateMany({},{$set: {androidAppVersion,androidForceUpdate,iosAppVersion,iosForceUpdate,radius,alert_live_number,hours_alert_delete
                    },
                }
            );
            req.flash('success', req.__('SETTINGS_UPDATE_SUCCESS'));
            return res.redirect('/settings');
        }
     
        async androidsubscriptionPage(req, res) {
            let setting = await AdminSettings.findOne();
            console.log(setting);
            return res.render('subscriptions/android',{setting})
        }

        async  iossubscriptionPage(req, res) {
            let setting = await AdminSettings.findOne();
            console.log(setting);
            return res.render('subscriptions/ios',{setting}) 
        }

        async androidsubsUpdate(req, res) {
            const {
                android_subscription_name,
                android_subscription_id,
                android_subscription_price
            } = req.body;
            
            await AdminSettings.updateMany({},{$set: {android_subscription_name,android_subscription_id,android_subscription_price},});

            req.flash('success', req.__('Android subscription update'));
            return res.redirect('/settings/android-subscription');
        }


        async iossubsUpdate(req, res) {
            const {
                ios_subscription_name,
                ios_subscription_id,
                ios_subscription_price
            } = req.body;
            
            await AdminSettings.updateMany({},{$set: {ios_subscription_name,ios_subscription_id,ios_subscription_price},});

            req.flash('success', req.__('IOS subscription update'));
            return res.redirect('/settings/ios-subscription');
        }
}

module.exports = new SettingsController();


