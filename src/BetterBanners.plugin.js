/**
 * @name BetterBanners
 * @author Bettlee
 * @description Allows you to locally assign a banner
 * @version 2.3.5
 * @authorId 725079599297331200
 * @authorLink https://github.com/Bettlee
 * @source https://github.com/Bettlee/BetterBanners/blob/main/src/BetterBanners.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Bettlee/BetterBanners/main/src/BetterBanners.plugin.js
 */

module.exports = (() => {

    const config = {
        info: {
            name: "BetterBanners",
            authors: [{
                name: "Bettlee",
                discord_id: "725079599297331200",
                github_username: "Bettlee"
            }],
            description: "Allows you to locally assign a banner",
            version: "2.3.5"
        }
    };
    return !global.ZeresPluginLibrary ? class {

        constructor() {

            this.config = config;
        };

        getName() {
            return config.info.name;
        };

        getAuthor() {
            return config.info.authors.map(m => m.name);
        };

        getVersion() {
            return config.info.version;
        };

        getDescription() {
            return config.info.description;
        };

        load() {

            BdApi.showConfirmationModal("Library Missing", `The library needed for ${config.info.name} is missing`, {

                confirmText: "Download",
                cancelText: "Cancel",

                onConfirm: () => {

                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, body) => {
                        if (error) {
                            return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        }
                        await new Promise(response => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, response));
                    });
                },
            });
        };

        start() {
        };

        stop() {
        };
    } : (([Plugin, Api]) => {

        const plugin = (Plugin, Api) => {

            const { Settings: { SettingPanel, SettingGroup, Switch, FilePicker }} = Api;
            return class BetterBanners extends Plugin {

                defaults = {
                    banner: {
                        clientsideBanner: false,
                        clientsideBannerURL: "",
                    },
                    clientsideGuildBanner: false
                };

                settings = { ...this.defaults, ...BdApi.Data.load(this.getName(), "settings") };

                getSettingsPanel() {
                    return SettingPanel.build(() => this.onStart(), new SettingGroup("Clientside Banner", { collapsible: false, shown: true }).append(new Switch("Clientside Banner", "Enable or disable a clientside banner", this.settings.banner.clientsideBanner, value => this.settings.banner.clientsideBanner = value), new FilePicker("File", "The direct file for the image you will be using, supported types are, JPEG, PNG, and or GIF", async image => {

                        this.settings.banner.clientsideBannerURL = await new Promise(resolve => {

                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.readAsDataURL(image);
                        });
                    }, { accept: "image/jpeg, image/png, image/gif", multiple: false })), new SettingGroup("Clientside Guild Banner", { collapsible: false, shown: false }).append(new Switch("Clientside Guild Banner", "Enable or disable a clientside guild banner", this.settings.banner.clientsideGuildBanner, value => this.settings.banner.clientsideGuildBanner = value, { disabled: true })));
                };

                observer({ addedNodes }) {

                    addedNodes.forEach(node => {

                        ["profileBanner", "popoutBanner", "settingsBanner", "bannerNormal"].forEach((banner, _, array) => {

                            const banners = node?.querySelector?.(`div[class *= "${banner}-"]`), attribute = {
                                attribute: "style",
                                value: {
                                    [banner]: `background-image: url("${this.settings.banner.clientsideBannerURL}"); background-repeat: no-repeat; background-position: 50%; background-size: cover; width: 100%; height: ${(banners?.className?.includes(array[0]) && "212px") || (banners?.className?.includes(array[1]) || (banners?.className?.includes(array[3])) && "120px")}`
                                }
                            };

                            if (banners?.className?.includes(banner) && (node?.querySelector?.(`.${BdApi.Webpack.getModule(m => m.username).username}`).textContent === BdApi.Webpack.getModule(m => m.getCurrentUser).getCurrentUser().username)) {

                                banners?.setAttribute(attribute.attribute, this.settings.banner.clientsideBanner ? attribute.value[banner] : `background-color: ${BdApi.Webpack.getModule(BdApi.Webpack.Filters.byStrings("e>>", `"#".concat`), { searchExports: true })(BdApi.Webpack.getModule(m => m.getName?.() === "UserProfileStore").getUserProfile(BdApi.Webpack.getModule(m => m.getCurrentUser).getCurrentUser().id).accentColor)}`);

                                const profileBanner = banners?.className?.includes(array[0]), popoutBanner = banners?.className?.includes(array[1]), bannerNormal = banners?.className?.includes(array[3]);
                                node?.querySelector?.(`svg[class *= "bannerSVGWrapper-"]`)?.setAttribute("viewBox", profileBanner ? (this.settings.banner.clientsideBanner ? "0 0 600 212" : "0 0 600 106") : (popoutBanner || bannerNormal) ? (this.settings.banner.clientsideBanner ? "0 0 340 120" : "0 0 340 60") : "0 0 660 100");
                                node?.querySelector?.(`svg[class *= "bannerSVGWrapper-"] circle`)?.setAttribute("cy", profileBanner ? (this.settings.banner.clientsideBanner ? "207" : "101") : (popoutBanner || bannerNormal) ? (this.settings.banner.clientsideBanner ? "116" : "56") : "122");
                            }
                        });

                        ["avatarWrapperNormal", "avatarUploaderNormal"].forEach(avatar => {

                            const avatars = node?.querySelector?.(`div[class *= "${avatar}-"]`), attribute = {
                                attribute: "style",
                                value: {
                                    [avatar]: "top: 76px"
                                }
                            };

                            if (avatars?.className?.includes(avatar) && (node?.querySelector?.(`.${BdApi.Webpack.getModule(m => m.username).username}`).textContent === BdApi.Webpack.getModule(m => m.getCurrentUser).getCurrentUser().username)) {

                                avatars?.setAttribute(attribute.attribute, this.settings.banner.clientsideBanner ? attribute.value[avatar] : "top: none");
                            }
                        });
                    });
                };

                onStart() {

                    BdApi.Data.save(this.getName(), "settings", this.settings);
                };

                onStop() {
                };
            };
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
