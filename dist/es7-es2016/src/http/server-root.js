"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const UrlUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/http/UrlUtils");
const js_beautify_1 = require("js-beautify");
const request_ext_1 = require("./request-ext");
const server_opds_browse_v1_1 = require("./server-opds-browse-v1");
const server_opds_browse_v2_1 = require("./server-opds-browse-v2");
const server_opds_convert_v1_to_v2_1 = require("./server-opds-convert-v1-to-v2");
const server_opds_local_feed_1 = require("./server-opds-local-feed");
const server_pub_1 = require("./server-pub");
const server_url_1 = require("./server-url");
const server_version_1 = require("./server-version");
function serverRoot(server, topRouter) {
    topRouter.get("/", (_req, res) => {
        const html = `\
<!DOCTYPE html>
<html>
<body>
<h1>Local Publications</h1>
${server.getPublications().map((pub) => {
            const filePathBase64 = Buffer.from(pub).toString("base64");
            return `\
<h2><a href=".${server_pub_1.serverPub_PATH}/${UrlUtils_1.encodeURIComponent_RFC3986(filePathBase64)}">\
${UrlUtils_1.isHTTP(pub) ? pub : path.basename(pub)}\
</a></h2>
`;
        }).join("")}\
${server.disableOPDS ? "" : `\
<p>
<a href='.${server_opds_local_feed_1.serverOPDS_local_feed_PATH}'>See OPDS2 Feed</a> (JSON)
</p>
`}\
<h1>Additional Services</h1>

<h2><a href='.${server_version_1.serverVersion_PATH}/${request_ext_1._show}'>Display Server Version</a></h2>

${server.disableRemotePubUrl ? "" : `\
<h2><a href='.${server_url_1.serverRemotePub_PATH}'>Load Remote Publication</a> (HTTP URL)</h2>
`}\

${server.disableOPDS ? "" : `\
<h2><a href='.${server_opds_browse_v1_1.serverOPDS_browse_v1_PATH}'>Browse OPDS1 (XML/Atom) feed</a> (HTTP URL)</h2>
<h2><a href='.${server_opds_browse_v2_1.serverOPDS_browse_v2_PATH}'>Browse OPDS2 (JSON) feed</a> (HTTP URL)</h2>
<h2><a href='.${server_opds_convert_v1_to_v2_1.serverOPDS_convert_v1_to_v2_PATH}'>Convert OPDS v1 to v2</a> (HTTP URL)</h2>
`}\

</body>
</html>
`;
        res.status(200).send(js_beautify_1.html(html));
    });
}
exports.serverRoot = serverRoot;
//# sourceMappingURL=server-root.js.map