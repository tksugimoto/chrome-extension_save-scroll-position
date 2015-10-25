
// インストール時に開いているすべてのタブにアイコン表示
chrome.tabs.query({}, function (tabs) {
	tabs.forEach(function (tab) {
		chrome.pageAction.show(tab.id);
	});
});

var scrollInfo = {};

// タブが開かれた/更新された時
chrome.tabs.onUpdated.addListener(function (tabId) {
	chrome.pageAction.show(tabId);
	delete scrollInfo[tabId];
	changePageActionInfo(tabId);
});

// 閉じた時
chrome.tabs.onRemoved.addListener(function (tabId) {
	delete scrollInfo[tabId];
});

/**********************************************************/


function save(tabId, scrollX, scrollY, comment) {
	if (!scrollInfo[tabId]) {
		scrollInfo[tabId] = [];
		changePageActionInfo(tabId);
	}
	var data = {
		time: Date.now(),
		scrollX: scrollX,
		scrollY: scrollY,
		comment: comment || ""
	};
	scrollInfo[tabId].push(data);
	return data;
}


function changePageActionInfo(tabId) {
	chrome.pageAction.setIcon({
		tabId: tabId,
		path: "icon/icon" + (scrollInfo[tabId] ? "_saved" : "") + ".png"
	});
	chrome.pageAction.setTitle({
		tabId: tabId,
		title: "ページ内の表示位置（スクロール量）を保存する" + (scrollInfo[tabId] ? "（保存データあり）" : "")
	});
}