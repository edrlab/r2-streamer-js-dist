riot.tag2('riot-menuselect', '<span class="mdc-select__selected-text">{getLabelForId(opts.selected)}</span> <div class="mdc-simple-menu mdc-select__menu"> <ul class="mdc-list mdc-simple-menu__items"> <li each="{opts.options}" class="mdc-list-item" role="option" tabindex="0" id="{id}" aria-selected="{id === parent.opts.selected}">{label}</li> </ul> </div>', '', 'class="mdc-select" role="listbox" tabindex="0"', function(opts) {
window.riot_menuselect.call(this, this.opts);
});
