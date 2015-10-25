
document.getElementById("comment").focus();
document.getElementById("comment").onkeydown = function (evt) {
	if (evt.keyCode === 13) {
		document.getElementById("save").onclick();
	}
};

chrome.tabs.query({
	windowId: chrome.windows.WINDOW_ID_CURRENT,
	active: true
}, function(result){
	if (result.length === 1) {
		var tabInfo = result[0];
		var tabId = tabInfo.id;
		
		var background = chrome.extension.getBackgroundPage();

		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
			if (sender.tab && request.method == "info") {
				if (tabId === sender.tab.id) {
					var scrollHeight = request.scrollHeight;
					var scrollX = request.scrollX;
					var scrollY = request.scrollY;
					document.getElementById("scrollRatio").innerText = scrollY / scrollHeight * 100 | 0;
					document.getElementById("save").onclick = function () {
						this.disabled = true;
						var data = background.save(tabId, scrollX, scrollY, document.getElementById("comment").value);
						append(data, scrollHeight);
					};
					(background.scrollInfo[tabId] || []).forEach(function (info) {
						append(info, scrollHeight);
					});
				}
			}
		});
		
		chrome.tabs.executeScript(null, {
			"code": "(" + getScrollInfo.toString() + ")()"
		});
	}
});

var container = document.getElementById("container");
function append(info, scrollHeight) {
	var time = info.time;
	var scrollX = info.scrollX;
	var scrollY = info.scrollY;
	var comment = info.comment;
	if (comment) comment += "： "
	
	var elem = document.createElement("button");
	elem.innerText = comment + (scrollY / scrollHeight * 100 | 0) + "%の位置にスクロール";
	elem.onclick = function () {
		chrome.tabs.executeScript(null, {
			"code": "(" + scrollTo.toString().replace("scrollX", scrollX).replace("scrollY", scrollY) + ")()"
		});
	};
	container.appendChild(elem);
	container.appendChild(document.createElement("br"));
}

function scrollTo() {
	document.body.scrollLeft = scrollX;
	document.body.scrollTop = scrollY;
}

function getScrollInfo() {
	var scrollX = document.body.scrollLeft;
	var scrollY = document.body.scrollTop;
	
	chrome.runtime.sendMessage({
		method: "info",
		scrollHeight: document.body.scrollHeight,
		scrollX: scrollX,
		scrollY: scrollY
	});
}
