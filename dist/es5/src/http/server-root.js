"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var js_beautify_1 = require("js-beautify");
var request_ext_1 = require("./request-ext");
var server_opds_browse_v1_1 = require("./server-opds-browse-v1");
var server_opds_browse_v2_1 = require("./server-opds-browse-v2");
var server_opds_convert_v1_to_v2_1 = require("./server-opds-convert-v1-to-v2");
var server_opds_local_feed_1 = require("./server-opds-local-feed");
var server_pub_1 = require("./server-pub");
var server_url_1 = require("./server-url");
var server_version_1 = require("./server-version");
function serverRoot(server, topRouter) {
    topRouter.get("/", function (_req, res) {
        var html = "<!DOCTYPE html>\n<html>\n<body>\n<h1>Local Publications</h1>\n" + server.getPublications().map(function (pub) {
            var filePathBase64 = new Buffer(pub).toString("base64");
            return "<h2><a href=\"." + server_pub_1.serverPub_PATH + "/" + UrlUtils_1.encodeURIComponent_RFC3986(filePathBase64) + "\">" + (UrlUtils_1.isHTTP(pub) ? pub : path.basename(pub)) + "</a></h2>\n";
        }).join("") + (server.disableOPDS ? "" : "<p>\n<a href='." + server_opds_local_feed_1.serverOPDS_local_feed_PATH + "'>See OPDS2 Feed</a> (JSON)\n</p>\n") + "<h1>Additional Services</h1>\n\n<h2><a href='." + server_version_1.serverVersion_PATH + "/" + request_ext_1._show + "'>Display Server Version</a></h2>\n\n" + (server.disableRemotePubUrl ? "" : "<h2><a href='." + server_url_1.serverRemotePub_PATH + "'>Load Remote Publication</a> (HTTP URL)</h2>\n") + "\n" + (server.disableOPDS ? "" : "<h2><a href='." + server_opds_browse_v1_1.serverOPDS_browse_v1_PATH + "'>Browse OPDS1 (XML/Atom) feed</a> (HTTP URL)</h2>\n<h2><a href='." + server_opds_browse_v2_1.serverOPDS_browse_v2_PATH + "'>Browse OPDS2 (JSON) feed</a> (HTTP URL)</h2>\n<h2><a href='." + server_opds_convert_v1_to_v2_1.serverOPDS_convert_v1_to_v2_PATH + "'>Convert OPDS v1 to v2</a> (HTTP URL)</h2>\n") + "\n</body>\n</html>\n";
        res.status(200).send(js_beautify_1.html(html));
    });
}
exports.serverRoot = serverRoot;
//# sourceMappingURL=server-root.js.map