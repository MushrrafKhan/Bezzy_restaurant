const {
    models: { Page },
} = require('../../../../lib/models');
class StaticController {
    async staticPages(req, res) {
        const slug = req.body.slug;
        try {
            const cms = await Page.findOne({ slug: slug });
            res.success(cms);
        } catch (err) {
            res.status(400).end(err);
        }
    }
}

module.exports = new StaticController();
