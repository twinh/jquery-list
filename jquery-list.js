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
        localData: false,
        $loading: null,
        loadingMsg: '努力加载中...',
        $finished: null,
        finishedMsg: '加载完毕',
        hideFinished: true,
        $empty: null,
        emptyMsg: '暂无数据',
        page: 1,
        filterExitingData: true,
        filterKey: 'id',
        filterData: {},
        beforeLoad: null,
        afterLoad: null,
        afterRender: null,

        initialize: function () {
            if (this.localData) {
                if (this.localData.data.length) {
                    this.render(this.localData.data);
                    if (!this._isLastPage(this.localData)) {
                        this.scroll();
                    }
                } else {
                    this.showEmpty();
                }
            } else {
                this.loadData(function () {

                });
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
                    fn && fn();
                    self.afterLoad && self.afterLoad(self, result);
                }
            }, this.ajax));
        },

        _isLastPage: function (result) {
            return (result.page - 1) * result.rows + result.data.length == result.records;
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
            for (var i in data) {
                if (this.filterExitingData) {
                    if (typeof this.filterData[data[i][this.filterKey]] != 'undefined') {
                        continue;
                    } else {
                        this.filterData[data[i][this.filterKey]] = true;
                    }
                }
                var $item = $($.trim(this.template(data[i])));
                $item.data('list-data', data[i]);
                this.$el.append($item);
                this.afterRender && this.afterRender($item);
            }
        },

        destroy: function () {
            this.$el.html('');
            this.$el.removeData('list');
            this.$empty && this.$empty.remove();
            this.$loading && this.$loading.remove();
        },

        filter: function (params) {
            this.$el.html('');
            this.page = 0;
            this.url = $.appendUrl(this.url, params);
            this.loadData(function () {
            });
        }
    });

    $.fn.list = function (option) {
        var pluginArgs = arguments;
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

            if (typeof option == 'string') {
                var args = [];
                for (var i in pluginArgs) {
                    if (i != 0) {
                        args.push(pluginArgs[i]);
                    }
                }
                data[option].apply(data, args);
            }
        });
    };
    $.fn.list.Constructor = List;
}($));

