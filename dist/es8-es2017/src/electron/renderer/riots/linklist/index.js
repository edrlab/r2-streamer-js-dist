riot.tag2('riot-linklist', '<nav if="{opts.links && opts.links.length}" class="{mdc-list: true, mdc-list--dense: true, mdc-list--two-line: !opts.basic}"> <a each="{opts.links}" no-reorder href="{parent.opts.url + \'/../\' + href}" data-href="{href}" title="{href}" onclick="{parent.onclick}" class="mdc-list-item mdc-ripple-surfacexx" data-mdc-auto-initxx="MDCRipple"> <span if="{title}" class="mdc-list-item__text"> {title} <span if="{!parent.opts.basic}" class="mdc-list-item__text__secondary">{href}</span> </span> <span if="{!title}" class="mdc-list-item__text"> {href} <span if="{!parent.opts.basic}" class="mdc-list-item__text__secondary"> </span> </span> </a> </nav> <p if="{!opts.links || !opts.links.length}">NO LINKS!?</p>', 'riot-linklist .mdc-list-item__text,[data-is="riot-linklist"] .mdc-list-item__text,riot-linklist .mdc-list-item__text__secondary,[data-is="riot-linklist"] .mdc-list-item__text__secondary{ white-space: nowrap; text-overflow: clip; } riot-linklist .mdc-list-item,[data-is="riot-linklist"] .mdc-list-item{ overflow-x: hidden; }', '', function(opts) {
window.riot_linklist.call(this, this.opts);
});