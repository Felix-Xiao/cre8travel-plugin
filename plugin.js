(function (window, document) {
    // 定义Robot构造函数
    function Robot() {
        this.dialogVisible = false;
        this.robotElement = null;
        this.dialogElement = null;
        this.content = '';
        this.init();
    }

    Robot.prototype.init = function () {
        // 引入 css
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/gh/Felix-Xiao/cre8travel-plugin@main/style.css';
        document.head.appendChild(link);

        const self = this;

        // 机器人容器
        self.robotElement = document.createElement('div');
        self.robotElement.className = 'coverButtonContainer';

        // 对话框
        self.dialogElement = document.createElement('div');
        self.dialogElement.id = 'robotDialog';
        self.dialogElement.className = 'robotDialog';
        self.robotElement.appendChild(self.dialogElement);
        document.body.appendChild(self.robotElement);
        self.dialogElement.style.visibility = 'hidden';

        // 机器人图片
        var img = document.createElement('img');
        img.src = 'https://cdn.jsdelivr.net/gh/Felix-Xiao/cre8travel-plugin@main/image/Hartford_ConCapital.png';
        img.className = 'coverButton';
        self.robotElement.appendChild(img);

        self.robotElement.addEventListener('click', function () {
            // handleTooltipClose();
        });
    };
    function handleTooltipClose() {
        const dialog = document.getElementById('robotDialog')
        dialog.textContent = content;
        dialog.style.visibility = 'hidden';
    }
    function handleConversationData(data) {
        let conversation = data[Math.floor(Math.random() * data.length)];
        let content = conversation.dialogueContent;
        let contentZh = conversation.dialogueContentZh;
        let dialogueVoice = conversation.dialogueVoice;
        let dialogueVoiceZh = conversation.dialogueVoiceZh;
        self.content = content;
        const dialog = document.getElementById('robotDialog')
        dialog.textContent = content;
        dialog.style.visibility = 'visible';

        clearTimeout(window.npcConversationClose);
        window.npcConversationClose = setTimeout(() => {
            handleTooltipClose();
        }, 20000);
    };
    function npcConversation(requestData) {
        return fetch('https://www.cre8travel.com/npcConversation/converse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
    }
    Robot.prototype.show = function (actionType, actionSubType) {
        const self = this;
        const requestData = {
            currentPage: 1,
            pageSize: 10,
            npcConversation: {
                npcId: 1,
                actionType: actionType,
                actionSubType: actionSubType
            }
        };

        npcConversation(requestData).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(res => {
                if (res.data && res.success && '0' === res.errorCode) {
                    // 获取npcConversation接口返回的数据，是个list，如果个数超过1，则随机取一个
                    if (res.data.length > 0) {
                        handleConversationData(res.data)
                    }
                } else if (res && res.success && '8000' === res.errorCode) {
                    // 当返回为8000时，由后端控制返回故事情节对话，npcId: 2, actionType: STORY
                    npcConversation({ npcConversation: { npcId: 2, actionType: ActionType.STORY, actionSubType: actionSubType } }).then((response) => {
                        handleConversationData(res)
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };
    window.Robot = Robot;
})(window, document);