/**
 * @link https://github.com/paulirish/infinite-scroll
 * @link https://github.com/andferminiano/jquery-scroll-pagination
 */
(function ($) {
    var List = function (options) {
        options && $.extend(this, options);
        this.initialize();
    };

    $.extend(List.prototype, {
        $el: null,
        $container: $(window),
        $content: $(document),
        scrollOffset: 40,
        template: null,
        url: null,
        ajax: {},
        localData: [],
        $loading: null,
        loadingMsg: '努力加载中...',
        $finished: null,
        finishedMsg: '加载完毕',
        hideFinished: true,
        $empty: null,
        emptyMsg: '暂无数据',
        page: 1,
        beforeLoad: null,
        afterLoad: null,

        initialize: function () {
            if (this.localData.length) {
                this.render(this.localData);
                this.scroll();
            } else {
                this.showEmpty();
            }
        },

        scroll: function () {
            var self = this;
            var loading = false;

            self.$container.scroll(function () {
                if (self.$finished) {
                    return;
                }
                if (self.$content.height() <= self.$container.height() + self.$container.scrollTop() + self.scrollOffset) {
                    if (loading == false) {
                        loading = true;
                        self.loadData(function () {
                            loading = false;
                        });
                    }
                }
            });
        },

        loadData: function (fn) {
            var self = this;
            this.page += 1;

            this.showLoading();
            this.beforeLoad && this.beforeLoad(this);

            $.ajax($.extend({
                url: this.url,
                data: {
                    page: this.page
                },
                dataType: 'json',
                success: function (result) {
                    self.hideLoading();
                    self.render(result.data);

                    if (self._isLastPage(result)) {
                        self.showFinished();
                    }
                    fn();
                    self.afterLoad && self.afterLoad(self, result);
                }
            }, this.ajax));
        },

        _isLastPage: function (result) {
            return (result.page-1) * result.rows + result.data.length == result.records;
        },

        showLoading: function () {
            if (!this.$loading) {
                this.$loading = $('<div class="list-loading">' + this.loadingMsg + '</div>');
                this.$loading.insertAfter(this.$el);
            }
            this.$loading.show();
        },

        hideLoading: function () {
            this.$loading.hide();
        },

        showFinished: function () {
            var self = this;
            if (!this.$finished) {
                this.$finished = $('<div class="list-finished">' + this.finishedMsg + '</div>');
                this.$finished.insertAfter(this.$el);
            }
            this.$finished.show();
            if (this.hideFinished) {
                setTimeout(function () {
                    self.$finished.hide();
                }, 2000);
            }
        },

        showEmpty: function () {
            if (!this.$empty) {
                this.$empty = $('<div class="list-empty">' + this.emptyMsg + '</div>');
                this.$empty.insertAfter(this.$el);
            }
        },

        // Render list item by specified data
        render: function (data) {
            var html = '';
            for (var i in data) {
                html += this.template(data[i]);
            }
            this.$el.append(html);
        }
    });

    $.fn.list = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('list');
            var options = typeof option == 'object' ? option : {};
            options.$el = $this;

            if (!data) {
                $this.data('list', (data = new List(options)));
            } else {
                $.extend(data, options);
            }
            if (typeof option == 'string') data[option]();
        });
    };
    $.fn.list.Constructor = List;
} ($));

