<template>
    <v-app :dark="!!isDark">
        <div class="app">
            <v-container bg fill-height grid-list-md text-xs-center>
                <v-layout row wrap align-center>
                    <v-flex align-content-center>
                        <h1 style="font-family: 'Comfortaa'; font-size: 36px">Random Steam Game Picker</h1><br>
                        <p style="font-family: 'Roboto'; font-size: 18px">
                            This tool allows you to pick a random Steam game from your library.<br>
                            Just enter your <a href="https://steamcommunity.com/dev/apikey">API key</a>,
                            your <a href="https://steamid.io">Steam ID</a> and you're good to go!<br>
                            <span style="font-size: 14px">The server does <u>not</u> store any of this information.
                            Hell, the server doesn't even get your API key.<br>
                            Your list of games does get cached to the client until you refresh, though.</span>

                            <v-form ref="form" v-model="valid" lazy-validation>
                                <v-layout row wrap style="width: 50%; margin: auto">
                                    <v-flex xs6>
                                        <v-text-field d-inline-block
                                        v-model="apikey" label="API Key" class="mr-2" required
                                        :rules="valrules"/>
                                    </v-flex>
                                    <v-flex xs6>
                                        <v-text-field d-inline-block
                                        v-model="steamid" label="Steam ID" class="ml-2"
                                        required :rules="valrules"/>
                                    </v-flex>
                                </v-layout>

                                <template v-if="isLoading == true">
                                    <v-progress-circular indeterminate class="mr-2"/>
                                    <span>{{ loadingStep }}</span>
                                </template>
                                <template v-else>
                                    <v-btn :disabled="!valid" color="success" @click="startLoading">Submit</v-btn>
                                </template>
                            </v-form>

                            <v-alert
                                :value="!!error"
                                type="error"
                                transition="slide-x-transition"
                                style="width: 50%"
                                outline
                                class="pt-2">{{error}}</v-alert><br>

                            <template v-if="!!doneFetching">
                                <p class="mb-0">Your randomly chosen game is</p>
                                <h1 style="font-family: 'Comfortaa'; font-size: 24px" class="mt-0">{{ gamename }}</h1>
                                <a :href="`steam://rungameid/${gameid}`">Launch</a> | <a :href="`https://store.steampowered.com/app/${gameid}`">View on Store</a>
                            </template>
                        </p>
                        <v-footer app class="ma-1 px-2">
                            <v-switch v-model="isDark" label="Dark" class="ml-2"></v-switch>
                            <span style="font-size: 18px; font-family: 'Roboto'; width: 100%" class="text-xs-right ma-3">
                                Built with <v-icon>favorite</v-icon>
                                and <a href="https://vuejs.org">Vue</a>
                                by <a href="https://ry00001.me">ry00001</a>.
                                <a href="https://github.com/ry00001/RandomSteamGame">Source code</a>.
                            </span>
                        </v-footer>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
    </v-app>
</template>

<style lang="stylus">
::-webkit-scrollbar
    display: none

::-ms-scrollbar
    display: none
</style>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            valid: false,
            isDark: true,
            isLoading: false,
            loadingStep: "Getting games...",
            apikey: "",
            steamid: "",
            valrules: [
                x => !!x || "This field is required."
            ],
            error: null,
            clearItTimeout: null,
            doneFetching: false,
            gameid: null,
            gamename: null,
            gameCache: null,

            badChars: [ // characters which don't render properly in Comfortaa
                '™',
                '©',
                '®'
            ]
        }
    },
    methods: {
        terminate(e) {
            this.error = e
            this.isLoading = false
            clearTimeout(this.clearItTimeout)
            this.clearItTimeout = setTimeout(() => {
                this.error = null
            }, 10000)
        },
        async startLoading() {
            if (!this.$refs.form.validate()) return
            this.doneFetching = false
            this.error = null
            this.isLoading = true
            clearTimeout(this.clearItTimeout)

            if (!this.gameCache) {
                this.loadingStep = "Getting games..."
                let getgamesurl =
                    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.apikey}&steamid=${this.steamid}&format=json`
                let t = await axios.get(getgamesurl)
                this.gameCache = t.data.response.games
            }
            try {
                let games = this.gameCache
                this.loadingStep = "Fetching game info..."
                let rg = games[Math.floor(Math.random() * games.length)]
                let app = rg.appid
                console.log(rg)
                let steamapi =
                    `https://store.steampowered.com/api/appdetails/?appids=${app}`
                let t = await axios.get(`https://api.allorigins.ml/get?method=raw&url=${encodeURIComponent(steamapi)}`)
                let bamana = t.data[app].data
                let name = bamana.name
                for (let i of this.badChars) name = name.replace(i, '')
                console.log(bamana)
                this.doneFetching = true
                this.gameid = bamana.steam_appid
                this.gamename = bamana.name
            } catch(e) {
                this.terminate("oopsie woopsie! couldn't get game info! this is probably steam messing up <a href=\"https://being-trans-and-in-italy-is.theworstme.me/47813f.png\">or games with no store pages</a>")
            }

            this.isLoading = false
        }
    }
}
</script>