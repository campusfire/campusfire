import React from 'react';
import logo from './cfwhite.png';
import './App.css';


class Display extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            texts: []
        };
    }

    componentDidMount(){
        this.checkKey(this.props.match.params.key);
    }

    checkKey(key){
        const _this = this;
        fetch('/display/'+key).then(function(resp){
            resp.text().then(function(txt){
                console.log(txt);
                if(txt === 'ok')
                    _this.setState({texts: ['Ok']});
                else
                    _this.setState({texts: ['Pas de display']});
            })
                .catch(function(){
                    _this.setState({texts: 'Erreur serveur'});
                });
        })
    }

    render(){
        const postits = [];

        for(const t in this.state.texts){
            postits.push(<PostIt text={this.state.texts[t]} />);

        }

        return (
            <div className="Display">
                <header>
                    <img src={logo} className="Display-logo" alt="logo" />

                </header>

                {postits}
            </div>
        );
    }

}

function PostIt(props){
    console.log(props);
    return (
        <div className="postit">
            {props.text}
        </div>
    );
}


export default Display;
