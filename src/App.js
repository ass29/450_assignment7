import React, {Component} from "react";
import FileUpload from "./FileUpload";
import Child1 from "./Child1";

class App extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            data: [],
        };
    }

    set_data = (json_data) =>
    {
        this.setState({data: json_data});
    };

    render()
    {
        return (
            <div>
                <FileUpload set_data={this.set_data}></FileUpload>
                {this.state.data.length > 0 && (
                    <div className="parent">
                        <Child1 csv_data={this.state.data}></Child1>
                    </div>
                )}
            </div>
        );
    }
}

export default App;
