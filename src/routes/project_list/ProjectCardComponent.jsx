import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import {v4 as uuid} from "uuid";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useNavigate} from "react-router-dom";
import AddLinkIcon from '@mui/icons-material/AddLink';

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme }) => ({
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
    variants: [
        {
            props: ({ expand }) => !expand,
            style: {
                transform: 'rotate(0deg)',
            },
        },
        {
            props: ({ expand }) => !!expand,
            style: {
                transform: 'rotate(180deg)',
            },
        },
    ],
}));

export default function ProjectCardComponent(props) {
    const [expanded, setExpanded] = React.useState(false);
    const navigate = useNavigate();

    // props {name, id, language, status}

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const removeButtonClick = async () => {
        props.openRemoveDialog()

    }

    const inviteGenerationClick = async ()=>{
        props.inviteAction()
    }



    return (
        <Card sx={{ maxWidth: 345 , backgroundColor: 'rgba(255, 0, 255, 0.2)', boxShadow: 2 }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label="project">
                        {props.language}

                    </Avatar>
                }

                title={props.name}
                subheader={props.status}
            />

            {/*
            тут может быть какая нибудь визуальная информация
            */}
            <CardMedia
                component="img"
                height="120"
                image="https://upload.wikimedia.org/wikipedia/ru/3/39/Java_logo.svg"
                alt="Project Card"
                sx={{ padding: "1em 1em 0 1em", objectFit: "contain" }}
            />
            <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {(props.privacyLevel==="PRIVATE"?"Приватный проект. ":"Открытый проект. ")+"Автор: "+props.author}

                </Typography>
            </CardContent>
            <CardActions disableSpacing>

                {
                    (props.view === "OWNER" || props.view === "PARTICIPANT") && <div>
                        <IconButton aria-label="start" onClick={()=>{
                        navigate("/workplace/projects/"+props.language+"/"+props.id)
                    }}>
                        <VisibilityIcon/>
                    </IconButton>


                    </div>
                }


                {props.view==="OWNER" && <IconButton aria-label="delete" onClick={()=>{
                    removeButtonClick()
                }}>
                    <DeleteIcon />
                </IconButton> }

                {props.view==="OWNER" && <IconButton onClick={
                    ()=>{
                        inviteGenerationClick();
                    }
                }>

                    <AddLinkIcon />
                </IconButton>}

                {(props.view==="READER" || props.view==="PARTICIPANT") && <IconButton >
                    <ContentCopyIcon/>
                </IconButton>}

                <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <ExpandMoreIcon />
                </ExpandMore>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Typography sx={{ marginBottom: 2 }}>Заголовок:</Typography>
                    <Typography sx={{ marginBottom: 2 }}>
                        Какой-то текст
                    </Typography>
                    <Typography sx={{ marginBottom: 2 }}>
                        Какой то текст 2
                    </Typography>
                    <Typography sx={{ marginBottom: 2 }}>
                        какой то текст 3
                    </Typography>
                    <Typography>
                       какой то текст 4
                    </Typography>
                </CardContent>
            </Collapse>
        </Card>
    );
}