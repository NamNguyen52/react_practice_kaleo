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
			displayedResults: [],
			page: 1,
			totalPages: 0,
			totalResults: 0,
			tags: [],
			filterByViews: false,
			filterByAnswers: false
		}
	},
	render: function() {

		// classes to be applied conditionally - 'classNames' method is provided globally by the classnames library
		var showHide = classNames({
			'hidden' : (this.state.results.length === 0)
		});
		var filterByViewsSelected = classNames({
			'btn btn-success' : this.state.filterByViews,
			'btn btn-primary' : !this.state.filterByViews
		});
		var filterByAnswersSelected = classNames({
			'btn btn-success' : this.state.filterByAnswers,
			'btn btn-primary' : !this.state.filterByAnswers
		});
		var nextButtonClasses = classNames({
			'hidden' : (this.state.page === this.state.totalPages),
		});
		var prevButtonClasses = classNames({
			'hidden' : (this.state.page === 1),
		});
		var filterBar = classNames({
			'btn-group btn-group-justified filter-buttons' : true,
			'hidden' : (this.state.results.length === 0)
		});

		return 	<div className="row">
					<div className="jumbotron">
					  	<h1 className="text-center">Welcome</h1>
					  	<p className="text-center">Enter your question or keywords below. Answers will populate as you type.</p>
					  	<div className="col-md-12">
						    <div className="input-group">
						    	<span className="input-group-btn">
						        	<button className="btn btn-default" type="button" onClick={ this.handleClearText }>Clear</button>
						      	</span>
						      	<input
						      		value={this.state.text}
						      		onChange={this.handleInputChange} 
						      		type="text" 
						      		className="form-control" 
						      		placeholder="Search for..." />
						      	
						    </div>
						</div>
					</div>
					<div className={ showHide }>
						<h3 className="text-center"> Total Results: <span className="label label-info">{ this.state.totalResults }</span></h3>
					</div>
					<div className={ filterBar } role="group">
					  	<div className="btn-group" role="group">
					    	<button type="button" className={ filterByViewsSelected } onClick={ this.handleFilterByViews }>Sort by Views</button>
					  	</div>
					  	<div className="btn-group" role="group">
					    	<button type="button" className={ filterByAnswersSelected } onClick={ this.handleFilterByAnswers }>Sort by Answer Count</button>
					  	</div>
					</div>
					<div className={ showHide }>						
						<h4><span className="btn btn-default btn-xs reset-button" dataToggle="tooltip" dataPlacement="top" title="Undo Tag Filtering" onClick={ this.handleResetTagFilter }>reset</span>Filter by tags: {
							this.state.tags.map((tag,i)=>
								<span className="label label-info tag" key={i} onClick={ this.sortByTag.bind(this, i) }>{ tag }</span>
							)
						}</h4>
					</div>
					<SearchResultsPanel results={ this.state.displayedResults }></SearchResultsPanel>
					<nav className={ showHide }>
						<div className="text-center">Page { this.state.page } of {this.state.totalPages }</div>
						<ul className="pager">
						  	<li className={ prevButtonClasses } onClick={this.handlePagePrev}>
						  		<a href="#"><span aria-hidden="true">&larr;</span> Previous</a>
						  	</li>
						  	<li className={ nextButtonClasses } onClick={this.handlePageNext}>
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
			this.setState({
				text: '', 
				filterByAnswers: false, 
				filterByViews: false, 
				results: [], 
				displayedResults: [],
				page: 1 });
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
		this.sortByViews();
	},
	handleFilterByAnswers: function(e) {
		e.preventDefault();
		this.setState({filterByViews: false, filterByAnswers: true });
		this.sortByAnswers(this.state.results);
	},
	handleResetTagFilter: function(e) {
		e.preventDefault();
		this.setState({displayedResults: this.state.results});
	},
	handleClearText: function(e) {
		e.preventDefault();
		this.setState({
			text: '', 
			filterByAnswers: false, 
			filterByViews: false, 
			results: [], 
			displayedResults: [],
			page: 1 });
	},
	searchApi: function(searchInput, page) {
		var self = this;
		var resourceUrl = 'https://demo1.kaleosoftware.com/v4/search.json?sitemap_token=123456789&sitemap=sales&term=';
		var searchClean = encodeURI(resourceUrl + searchInput +'&page=' + page);
		console.log(searchClean);
		$.get(searchClean, function(data){

			self.setState({
				totalPages: data.meta.total_pages,
				totalResults: data.meta.total_results,
				results: data.collection
			});
			self.gatherReturnedTags(data.collection);

			if (self.state.filterByViews) {
				self.sortByViews(data.collection);
			} else if (self.state.filterByAnswers) {
				self.sortByAnswers(data.collection);
			} else {
				self.setState({displayedResults: data.collection});
			}
		});
	},
	gatherReturnedTags: function(searchResults) {
		var unique = {};
		var tempArr = searchResults.map((a) => a.tag_names );
		var flattened = [].concat.apply([], tempArr);
		var removedDuplicates = flattened.filter((b) =>
			unique.hasOwnProperty(b) ? false : (unique[b] = true)
		)
		this.setState({tags: removedDuplicates});
	},
	sortByViews: function() {
		var tempArr = this.state.results.sort((a,b) => b.views_count - a.views_count);
		this.setState({displayedResults: tempArr});
	},
	sortByAnswers: function() {
		var tempArr = this.state.results.sort((a,b) => b.answers_count - a.answers_count );
		this.setState({displayedResults: tempArr});
	},
	sortByTag: function(tagIndex) {
		var tempArr = this.state.results.filter((a) => a.tag_names.indexOf(this.state.tags[tagIndex]) === -1 ? false : a);
		this.setState({displayedResults: tempArr});
	}
});

// individual search results
var SearchResultsPanel = React.createClass({
	render: function() {
		return 	(<div className="list-group">
					{
						this.props.results.map((result, i) =>
					 		<a href={ result.url_anonymous } target="_blank" className="list-group-item" key={i}>
					    		<h4 className="list-group-item-heading">{ result.title }</h4>
					    		<span className="badge">{ result.views_count } Views</span>
					    		<p className="list-group-item-text">Answer Counts: { result.answers_count }</p>
					    		<p className="list-group-item-text">Tags: {
					    			result.tag_names.map((tag, i) =>
					    				<span className="label label-info tag-label" key={i}>{ tag }</span>
					    			)
					    		}</p>
							</a>
						)
					}
				</div>)
	}
});

var searchContainerElement = React.createElement(SearchContainer, {});

ReactDOM.render(searchContainerElement, document.getElementById('search-container'));














