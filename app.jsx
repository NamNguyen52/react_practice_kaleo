/**
*
* React Classes
*
*/ 

// search box
var SearchContainer = React.createClass({
	getInitialState: function() {
		return {
			text: '',
			results: [],
			page: 1,
			filterByViews: false,
			filterByAnswers: false
		}
	},
	render: function() {
		return 	<div>
					<div className="jumbotron">
					  	<h1 className="text-center">Welcome</h1>
					  	<p className="text-center">Enter your question or keywords below. Answers will populate as you type.</p>
					  	<div className="col-lg-12">
						    <div className="input-group">
						      	<input
						      		value={this.state.text}
						      		onChange={this.handleInputChange} 
						      		type="text" 
						      		className="form-control" 
						      		placeholder="Search for..." />
						      	<span className="input-group-btn">
						        	<button className="btn btn-default" type="button" onClick={ this.handleClearText }>Clear</button>
						      	</span>
						    </div>
						</div>
					</div>
					<div className="btn-group btn-group-justified filter-buttons" role="group">
					  	<div className="btn-group" role="group">
					    	<button type="button" className="btn btn-success" onClick={ this.handleFilterByViews }>Sort by Views</button>
					  	</div>
					  	<div className="btn-group" role="group">
					    	<button type="button" className="btn btn-primary" onClick={ this.handleFilterByAnswers }>Sort by Answer Count</button>
					  	</div>
					  	<div className="btn-group" role="group">
					    	<button type="button" className="btn btn-info">Sort by Tag</button>
					 	</div>
					</div>
					<SearchResultsPanel results={ this.state.results }></SearchResultsPanel>
					<nav>
						<ul className="pager">
						  	<li className="previous" onClick={this.handlePagePrev}>
						  		<a href="#"><span aria-hidden="true">&larr;</span> Previous</a>
						  	</li>
						  	<li className="next" onClick={this.handlePageNext}>
						  		<a href="#">Next <span aria-hidden="true">&rarr;</span></a>
					  		</li>
						</ul>
					</nav>
				</div>
				
	},
	handleInputChange: function(e) {
		console.log(e.target.value);
		e.preventDefault();
		if (e.target.value.length === 0) {
			this.setState({text: e.target.value, results: [] });
		} else {
			this.setState({text: e.target.value});
			this.searchApi(e.target.value, this.state.page);
		}
	},
	handlePageNext: function(e) {
		e.preventDefault();
		this.setState({page: this.state.page += 1});
		this.searchApi(this.state.text, this.state.page);
	},
	handlePagePrev: function(e) {
		e.preventDefault();
		this.setState({page: this.state.page -= 1});
		this.searchApi(this.state.text, this.state.page);
	},
	handleFilterByViews: function(e) {
		e.preventDefault();
		this.setState({filterByViews: true, filterByAnswers: false});
		this.searchApi(this.state.text, this.state.page);
	},
	handleFilterByAnswers: function(e) {
		e.preventDefault();
		this.setState({filterByViews: false, filterByAnswers: true });
		this.searchApi(this.state.text, this.state.page);
	},
	handleClearText: function(e) {
		e.preventDefault();
		this.setState({text: '', filterByAnswers: false, filterByViews: false, results: [] });
	},
	searchApi: function(searchInput, page) {
		var self = this;
		var resourceUrl = 'https://demo1.kaleosoftware.com/v4/search.json?sitemap_token=123456789&sitemap=sales&term=';
		var searchClean = encodeURI(resourceUrl + searchInput +'&page=' + page);
		console.log(searchClean);
		$.get(resourceUrl + searchClean, function(data){
			if (self.state.filterByViews) {
				var orderedByViewsArr = self.sortByViews(data);
				self.filterData(orderedByViewsArr);
			} else if (self.state.filterByAnswers) {
				var orderedByAnswersArr = self.sortByAnswers(data);
				self.filterData(orderedByAnswersArr);
			} else {
				var unfilteredResults = self.standardPrep(data);
				self.filterData(unfilteredResults);
			}
		});
	},
	filterData: function(resultArr) {
		var tempArr = resultArr.map(function(a){
			var tempObj = {
				title: a.title,
				answerUrl: a.url_anonymous,
				tags: a.tag_names,
				views: a.views_count,
				numOfAnswers: a.answers_count 
			}
			return tempObj;
		});
		this.setState({results: tempArr});
	},
	sortByViews: function(searchResults) {
		var tempArr = searchResults.collection.sort(function(a,b){
			return b.views_count - a.views_count;
		});
		return tempArr;
	},
	sortByAnswers: function(searchResults) {
		var tempArr = searchResults.collection.sort(function(a,b){
			return b.answers_count - a.answers_count;
		});
		return tempArr;
	},
	standardPrep: function(searchResults) {
		var tempArr = searchResults.collection.map(function(a){
			return a;
		});
		return tempArr;
	}
});

// individual search results
var SearchResultsPanel = React.createClass({
	render: function() {
		return 	(<div className="list-group">
					{
						this.props.results.map(function(result, i) {
							return 	<a href={ result.answerUrl } target="_blank" className="list-group-item" key={i}>
							    		<h4 className="list-group-item-heading">{ result.title }</h4>
							    		<span className="badge">{ result.views } Views</span>
							    		<p className="list-group-item-text">Answer Counts: { result.numOfAnswers }</p>
							    		<p className="list-group-item-text">Tags: {
							    			result.tags.map(function(tag, i){
							    				return <span className="label label-info tag-label" key={i}>{ tag }</span>
							    			})
							    		}</p>
									</a>
						})
					}
				</div>)
	}
});

var searchContainerElement = React.createElement(SearchContainer, {});

ReactDOM.render(searchContainerElement, document.getElementById('search-input-container'));














