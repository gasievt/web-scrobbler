'use strict';

const filter = MetadataFilter.createFilter({
	track: removeMV,
});

let trackInfo = {};
let timeInfo = {};
let isPlaying = false;

Connector.getTimeInfo = () => {
	const { currentTime, duration } = document.querySelector('#aPlayer');
	return { currentTime, duration };
};

Connector.playerSelector = '.m-upload-list';

Connector.applyFilter(filter);

Connector.injectScript('./connectors/eggs-dom-inject.js');


if (window.location.href.includes('/artist/')) {
	setupArtistPlayer();
} else {
	setupSongPlayer();
}

function setupYoutubePlayer() {
	Connector.getTrackInfo = () => trackInfo;

	Connector.isPlaying = () => isPlaying;

	Connector.getTimeInfo = () => timeInfo;
}

function setupArtistPlayer() {
	const observer = new MutationObserver(checkToggleArtist);

	observer.observe(document.body, { childList: true });

	setArtistConnector();
}

function setArtistConnector() {
	Connector.getTrackInfo = () => {
		const parentLi = document.querySelector('.pause[style*="display: block"]').closest('li');

		const songInfo = {
			artist: parentLi.querySelector('.artist_name').textContent,
			track: parentLi.querySelector('.player').dataset.srcname,
			trackArt: parentLi.querySelector('img').src,
		};

		return songInfo;
	};

	Connector.isPlaying = () => {
		document.querySelectorAll('.pause[style*="display: block;"]').length;
	};
}

function setupSongPlayer() {
	Connector.trackArtSelector = '.img-album img';

	Connector.artistSelector = '.artist_name a';

	Connector.trackSelector = '#js-product-name-0 p';

	Connector.pauseButtonSelector = '.pause';
}

function checkToggleArtist(mutationList) {
	const removedList = mutationList[0].removedNodes;

	if (removedList.length) {

		// external player has been closed
		if (removedList[0].classList.contains('fancybox-overlay')) {

			setArtistConnector();

		}
	}
}

Connector.onScriptEvent = (event) => {
	({ trackInfo, isPlaying, timeInfo } = event.data);

	if (event.data.playerType === 'youtube') {
		Connector.onStateChanged();
	} else if (event.data.playerType === 'youtubestart') {
		setupYoutubePlayer();
	}
};

function removeMV(text) {
	return text.replace(/(\(MV\)|【MV】|MV)$/, '');
}
