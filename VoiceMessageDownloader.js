/**
 * @name VoiceMessageDownloader
 * @author DraqzzIQ
 * @description Adds the ability to download voice messages
 * @version 0.0.1
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		return class VoiceMessageDownloader extends Plugin {
			onLoad () {}
			
			onStart () {}
			
			onStop () {}

			onMessageContextMenu (e) {
				if (!e.instance.props.message) return;
        if (!e.instance.props.message.attachments[0]) return;
				if(e.instance.props.message.attachments[0].content_type != "audio/ogg") return;
				let entries = [
					BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: "Download",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "download-voice-message"),
						type: "Message",
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: BDFDB.LibraryComponents.SvgIcon.Names.DOWNLOAD
						}),
						action: _ =>{
              let url = e.instance.props.message.attachments[0].url.replace("cdn.discordapp.com", "media.discordapp.net");
              console.log(url)

              BDFDB.DiscordUtils.requestFileData(url, (error, buffer) => {
                let hrefURL = window.URL.createObjectURL(new Blob([buffer], {type: "ogg"}));
                console.log(hrefURL);
                let tempLink = document.createElement("a");
                tempLink.href = hrefURL;
                tempLink.download = "voice-message.ogg";
                tempLink.click();
                window.URL.revokeObjectURL(hrefURL);
              });
          }
					})
				].filter(n => n);
				if (entries.length) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "copy-link"});
					children.splice(index > -1 ? index + 1 : children.length, 0, entries.length > 1 ? BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: "Download",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "download-voice-message-submenu"),
						children: entries.map(n => {
							n.props.label = n.props.type;
							delete n.props.type;
							delete n.props.icon;
							return n;
						})
					}) : entries);
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();