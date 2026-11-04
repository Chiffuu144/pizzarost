import { Helmet } from 'react-helmet'

const MetaData = ({ title }) => {
    return (
        <Helmet>
            <title>{`${title} - Pizzaro`}</title>
        </Helmet>
    )
}

export default MetaData